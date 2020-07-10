<?php
/**
 * Created by PhpStorm.
 * User: Илья
 * Date: 15.12.2016
 * Time: 14:16
 */

namespace zrk4939\widgets\yamap\assets;



class YandexApiAsset extends \yii\web\AssetBundle
{
    /**
     * @inheritdoc
     */
    public $sourcePath = '@vendor/zrk4939/widgets/yamap/assets/dist';

    /**
     * @inheritdoc
     */
    public $css = [
        'css/yandex.min.css',
    ];

    /**
     * @inheritdoc
     */
    public $jsOptions = [
        'defer' => ''
    ];

    /**
     * @inheritdoc
     */
    public $js = [
        'https://api-maps.yandex.ru/2.1/?apikey=583bbe5d-c554-4031-bbea-ce44ffaf8194&lang=ru_RU',
        (YII_DEBUG) ? 'js/yandex-api.js' : 'js/yandex-api.min.js',
    ];

    /**
     * @inheritdoc
     */
    public $depends = [
        'yii\web\JqueryAsset',
    ];
}