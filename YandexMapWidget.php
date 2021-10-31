<?php
/**
 * Created by PhpStorm.
 * User: Илья
 * Date: 15.12.2016
 * Time: 13:54
 */

namespace zrk4939\widgets\yamap;


use yii\helpers\ArrayHelper;
use yii\helpers\Json;
use yii\widgets\InputWidget;

class YandexMapWidget extends InputWidget
{
    public $attributes = [];
    public $click_handle = true;
    public $leadLatLng = false;

    public $inputOptions = [];
    public $label = 'Воспользуйтесь поиском';

    public $helpMe = false;

    public $inputId = 'address-search';

    protected $defaultAttributes = [
        'latitude' => null,
        'longitude' => null,
        'cityName' => null,
        'address' => null,
        'CountryName' => null,
        'AdministrativeAreaName' => null,
        'SubAdministrativeAreaName' => null,
        'LocalityName' => null,
        'street' => null,
        'home' => null
    ];

    /**
     * @return string
     */
    public function run()
    {
        $attributes = ArrayHelper::merge($this->defaultAttributes, $this->attributes);
        $inputOptions = [
            'class' => 'project-input',
            'autocomplete' => 'off',
            'placeholder' => 'Пример: Киров, ул. Ленина, 18',
            //'aria-required' => 'true',
        ];

        return $this->render('main', [
            'helpMe' => $this->helpMe,
            'model' => $this->model,
            'attributes' => $attributes,
            'click_handle' => Json::encode($this->click_handle),
            'leadLatLng' => Json::encode($this->leadLatLng),
            'inputOptions' => ArrayHelper::merge($inputOptions, $this->inputOptions, ['id' => $this->inputId]),
            'label' => $this->label,
        ]);
    }
}
