<?php

use Bitrix\Main\Engine\Controller;
use Bitrix\Main\Context;
use Bitrix\Main\Engine\Response\AjaxJson;
use Bitrix\Main\Error;
use Bitrix\Main\Loader;
use Bitrix\Main\Result;
use Bitrix\Main\Web\HttpClient;
use Bitrix\Main\Web\Json;
use Bitrix\Main\Localization\Loc;
use WC\Core\ORM\Captcha\CaptchaTable;

class WCReCaptcha3AjaxController extends Controller
{
    public function configureActions(): array
    {
        return [
            'processCaptcha' => [
                'prefilters' => [], 'postfilters' => [],
            ],
        ];
    }

    public function processCaptchaAction($token, $captchaSid): AjaxJson
    {
        $result = new Result();
        $httpClient = new HttpClient();
        $unsignedParameters = $this->getUnsignedParameters();
        $ip = Context::getCurrent()->getServer()->get('REMOTE_ADDR');
        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $url = "$url?secret={$unsignedParameters['SECRET_KEY']}&response=$token&remoteip=$ip";

        try {
            $get = $httpClient->get($url);
            $get = Json::decode($get);
            if ($get['success'] === true) {
                if ($get['score'] >= $unsignedParameters['SCORE']) {
                    $captchaWord = $this->getCaptchaWord($captchaSid);
                    $result->setData(['captchaWord' => $captchaWord]);
                } else {
                    $error = new Error(Loc::getMessage('WC_RECAPTCHA3_VERIFY_FAILED'));
                    $result->addError($error);
                }
            } else {
                foreach ($get['error-codes'] as $key => $errorCode) {
                    $error = new Error($errorCode, $key);
                    $result->addError($error);
                }
            }
        } catch (Exception $e) {
            $error = new Error($e->getMessage());
            $result->addError($error);
        }

        $isSuccess = $result->isSuccess() ? AjaxJson::STATUS_SUCCESS : AjaxJson::STATUS_ERROR;

        return new AjaxJson($result->getData(), $isSuccess, $result->getErrorCollection());
    }

    private function getCaptchaWord($captchaSid)
    {
        if (Loader::includeModule('wc.core')) {
            $dbRes = CaptchaTable::getList([
                'select' => ['CODE'],
                'filter' => ['=ID' => $captchaSid],
            ]);
            if ($captcha = $dbRes->fetch()) {
                return $captcha['CODE'];
            }
        } else {
            $captcha = new CCaptcha();
            $captcha->InitCode($captchaSid);
            return $captcha->code;
        }

        return null;
    }
}
