class ReCaptcha3 {
    constructor(param) {
        this.param = param;
        this.catpchaSid = document.getElementById('wcCaptchaSid').value;
    }

    async getParams() {
        let response = await BX.ajax.runComponentAction('wc:recaptcha3', 'getParams', {
            mode: 'class',
            signedParameters: this.param.signedParameters
        });
        if (response.status == 'success') {
            if (!this.isDefined(response.data.siteKey)) {
                return this.error(1);
            }
            if (!this.isDefined(response.data.secretKey)) {
                return this.error(2);
            }
            if (!this.isDefined(response.data.action)) {
                return this.error(3);
            }
            if (!this.isDefined(response.data.score)) {
                return this.error(4);
            }
            return response;
        }
        return this.error(5);
    }

    handler() {
        if (!this.isDefined(this.catpchaSid)) {
            return this.error(0);
        }
        grecaptcha.ready(async () => {
            let params = await this.getParams();
            if (!this.isDefined(params)) {
                return;
            }
            let token = await grecaptcha.execute(params.data.siteKey, {action: params.data.action});
            if (!this.isDefined(token)) {
                return this.error(6);
            }
            let siteVerify = await this.siteVerify(params.data.secretKey, token);
            if (!this.isDefined(siteVerify)) {
                return this.error(7);
            }
            if (siteVerify.data.success == true) {
                if (siteVerify.data.score >= params.data.score) {
                    document.getElementById('wcCaptchaWord').value = await this.getCaptchaWord();
                } else {
                    return this.error(8);
                }
            } else {
                this.errorCodes = siteVerify.data["error-codes"].join('; ');
                return this.error(9);
            }
        });
    }

    async siteVerify(secretKey, token) {
        let response = await BX.ajax.runComponentAction('wc:recaptcha3', 'siteVerify', {
            mode: 'class',
            data: {
                secretKey: secretKey,
                token: token,
            }
        });
        if (response.status == 'success') {
            return response;
        }
        return false;
    }

    async getCaptchaWord() {
        let responce = await BX.ajax.runComponentAction('wc:recaptcha3', 'getCaptchaWord', {
            mode: 'class',
            data: {
                catpchaSid: this.catpchaSid,
            }
        });
        return responce.data.captchaWord;
    }

    error(num) {
        let error;
        switch (num) {
            case 0:
                error = `������ #${num}. �� ������� �������� sid �����.`;
                break;
            case 1:
                error = `������ #${num}. �� ������ ���� �����.`;
                break;
            case 2:
                error = `������ #${num}. �� ������ ��������� ����.`;
                break;
            case 3:
                error = `������ #${num}. �� ������ ��� ��������.`;
                break;
            case 4:
                error = `������ #${num}. �� ������ ����������� ����.`;
                break;
            case 5:
                error = `������ #${num}. �� ������� �������� ���������.`;
                break;
            case 6:
                error = `������ #${num}. �� ������� �������� �����.`;
                break;
            case 7:
                error = `������ #${num}. API Google: �� ������� �������� �����.`;
                break;
            case 8:
                error = `������ #${num}. � ���������, Google reCaptcha v3 ������, ��� �� ��� :(.`;
                break;
            case 9:
                error = `������ #${num}. API Google: �� ������� ��������� ������������. ${this.errorCodes}.`;
                break;
        }
        console.log(error);
        return false;
    }

    isDefined(param) {
        if (typeof param == 'undefined' || param == '') {
            return false;
        }
        return true;
    }
}