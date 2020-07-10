<?php

use domain\widgets\YandexMap\assets\YandexApiAsset;
use yii\helpers\Html;
use yii\helpers\Json;

/* @var $this yii\web\View */
/* @var $model yii\base\Model */
/* @var $form frontend\components\ActiveForm */
/* @var $click_handle boolean */
/* @var $leadLatLng boolean */
/* @var $attributes array */
/* @var $districts domain\modules\parser\models\ObjectDistrict[] */
/* @var $inputOptions array */
/* @var $label string */
/* @var $helpMe boolean */

YandexApiAsset::register($this);

$dataApiAttributes = [];

foreach ($attributes as $key => $attribute) {
    $dataApiAttributes[$key] = (!empty($attribute)) ? Html::getInputId($model, $attribute) : null;
}

$idPrefix = $model->formName();

$script = <<<JS
$(function () {
        var config = {
        mapBlockId: '$idPrefix-city-map',
        click_handle: '$click_handle',
        leadLatLng: '$leadLatLng',
        fields: {
            latitude: '{$dataApiAttributes['latitude']}',
            longitude: '{$dataApiAttributes['longitude']}',
            cityName: '{$dataApiAttributes['cityName']}',
            address: '{$dataApiAttributes['address']}',
            CountryName: '{$dataApiAttributes['CountryName']}',
            AdministrativeAreaName: '{$dataApiAttributes['AdministrativeAreaName']}',
            SubAdministrativeAreaName: '{$dataApiAttributes['SubAdministrativeAreaName']}',
            LocalityName: '{$dataApiAttributes['LocalityName']}',
            street: '{$dataApiAttributes['street']}',
            home: '{$dataApiAttributes['home']}'
        }
    };

window.y_api = new YandexApiConstructor(config);
if (window.ymaps) {
    ymaps.ready(function() {
      window.y_api.init();
    });
}
});
JS;
$this->registerJs($script);
?>

    <!-- Блок для Яндекс-карты -->
    <div class="field-wrap required">
        <?php if (Json::decode($click_handle)): ?>
            <div id="search-address">
                <!-- LABEL -->
                <?php
                if ($helpMe) {
                    echo Html::label($label . Html::img('/images/help-icon-input.png'), null, [
                        'class' => 'project-label help-me',
                        'data-toggle' => 'popover-x',
                        'data-target' => '#estate-address',
                    ]);
                } else {
                    echo Html::label($label, null, [
                        'class' => 'project-label',
                    ]);
                }
                ?>

                <?= Html::input('text', Html::getInputName($model, 'address_search'), null, $inputOptions) ?>
                <?php /*echo Html::input('text', 'search-address', null, $inputOptions)*/ ?>
                <?= Html::tag('span', '+', ['class' => 'search-address-cancel']) ?>
                <?= Html::tag('ul', '', ['id' => 'search-address-variants']) ?>
            </div>
        <?php endif; ?>
    </div>
    <div>
        <div class="map-wrapper">
            <?= Html::tag('div', null, [
                'id' => $idPrefix . '-city-map',
                'class' => 'yandex-map-api-block'
            ]) ?>
        </div>
    </div>
<?php
if (Json::decode($click_handle)) {
    echo Html::tag('div', 'Кликните в нужном месте на карте, чтобы указать координаты', ['class' => 'hint-block']);
}
?>

<?= Html::hiddenInput('districts', Json::encode($districts), ['id' => 'districts']) ?>