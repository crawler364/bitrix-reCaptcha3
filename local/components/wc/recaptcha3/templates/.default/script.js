/*
grecaptcha.ready(function () {
    //TODO ajax ������ �������� siteKey
    let siteKey = $.ajax({
        url: '/local/components/wc.recaptcha3/component.php',
        async: false,
        data: {
            action: 'getSiteKey'
        }
    }).responseText;
    console.log(siteKey);
    grecaptcha.execute(siteKey, {action: 'homepage'}).then(function (token) {
        alert(token);
        //TODO ajax ��������� ����� ������������, �� ������� $url = $google_url . "?secret=" . $arSettings["secretkey"] . "&response=" . $arRequest["g-recaptcha-response"] . "&remoteip=" . $server->get('REMOTE_ADDR'); ���� score ���������� ���������� � ������ ������ �����

    });
});*/

BX.ajax.runComponentAction('wc:recaptcha3', 'test', {
    mode: 'class'
}).then(function (response) {
    console.log(response)
});