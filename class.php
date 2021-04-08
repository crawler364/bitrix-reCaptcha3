<?

class WCReCaptcha3 extends CBitrixComponent
{
    public function executeComponent()
    {
        global $APPLICATION;

        $this->arResult['CAPTCHA_ID'] = uniqid();
        $this->arResult['CAPTCHA_SID'] = $APPLICATION->CaptchaGetCode();

        $this->includeComponentTemplate();
    }

    protected function listKeysSignedParameters(): array
    {
        return ['SITE_KEY', 'SECRET_KEY', 'ACTION', 'SCORE', 'POSITION'];
    }
}
