/**
 *
 * @param config
 * @constructor
 *
 * @doc https://tech.yandex.ru/maps/doc/jsapi/2.1/ref/concepts/About-docpage/
 *
 * TODO refactoring
 */
var searchInput = $('#address-search');

function YandexApiConstructor(config) {
    this.map = null;
    this.mapBlockId = config.mapBlockId || 'yandex-map';
    this.fields = config.fields;
    this.click_handle = config.click_handle;
    this.leadLatLng = config.leadLatLng;

    this.blocks = {
        latitude: null,
        longitude: null,
        cityName: null,
        address: null,

        CountryName: null,
        AdministrativeAreaName: null,
        SubAdministrativeAreaName: null,
        LocalityName: null,

        street: null,
        home: null
    };

    var $this = this;
    var cancelBtn = $('.search-address-cancel');

    this.init = function () {
        if (!window.ymaps) {
            return false;
        }

        this.initMap();
        this.initBlocks();
        this.drawDistricts();
        this.actionUpdate();
        this.initEvents();
        // TODO Разобраться после отпуска: initClickEvent() - для всех видов, кроме новостройки
        /*if ($this.click_handle === 'true') {
            this.initClickEvent();
        }*/
    };

    this.initMap = function () {
        $this.map = new ymaps.Map($this.mapBlockId, {
                center: [58.60, 49.62], // Киров
                zoom: 15,
                controls: ['typeSelector', 'zoomControl']
            },
            {
                autoFitToViewport: false
            },
            {
                balloonMaxWidth: 200
            }
        );
    };

    this.initBlocks = function () {
        $.each($this.fields, function (index, value) {
            if (value !== "") {
                $this.blocks[index] = $(document.getElementById(value));
            }
        });
    };

    this.drawDistricts = function () {
        var polygonStr = $('[name="districts"]').val();

        try {
            polygonStr = JSON.parse(polygonStr);
            //polygonStr = ymaps.geometry.Polygon.fromEncodedCoordinates(polygonStr);
        } catch (e) {
            //console.log('error parse');
            polygonStr = [];
        }

        $.each(polygonStr, function (index, elem) {
            var coordinates = JSON.parse(elem.polygon);
            var secPoligon = new ymaps.Polygon(coordinates, {
                hintContent: elem.name
            }, {
                fillColor: '#aaaaaa',
                strokeColor: '#555555',
                strokeWidth: 2,
                opacity: 0.3,
                // Делаем полигон прозрачным для событий карты.
                interactivityModel: 'default#transparent'
            });
            $this.map.geoObjects.add(secPoligon);
        });
    };

    this.newPlaceMark = function (coordinates, setCenter) {
        // создаем метку
        var PlaceMark = new ymaps.Placemark(coordinates, {}, {
            draggable: true
        });
        // добавляем на карту
        $this.map.geoObjects.add(PlaceMark);

        // и инициализируем для нее собитие окончания перетаскивание
        PlaceMark.events.add('dragend', function () {
            coordinates = PlaceMark.geometry.getCoordinates();
            if ($this.fields.latitude && $this.fields.longitude) {
                $this.blocks.latitude.val(coordinates[0]);
                $this.blocks.longitude.val(coordinates[1]);
            }

            $this.getAddressOfCoordinates(coordinates);
        });

        if (setCenter) {
            $this.map.setCenter(coordinates);
        }
    };

    this.actionUpdate = function () {
        // При обновлении (actionUpdate) добавляем на карту объект
        // с координатами из полей blockLatId и blockLongId
        if ($this.blocks.latitude && $this.blocks.longitude && $this.blocks.latitude.val() && $this.blocks.longitude.val()) {
            var office_x = $this.blocks.latitude.val();
            var office_y = $this.blocks.longitude.val();

            this.newPlaceMark([office_x, office_y], true);
            if ($this.leadLatLng) {
                $this.getAddressOfCoordinates([office_x, office_y]);
            }
        } else if ($this.blocks.address) {
            this.searchByAddress($this.blocks.address.val());
        }
    };

    this.initEvents = function () {
        if ($this.click_handle === 'true') {
            this.initClickEvent();
        }

        this.initCancelButton();

        this.initSearchForm();
    };

    let clickEvent = function (e) {
        var coordinates = e.get('coords');

        $this.getAddressOfCoordinates(coordinates);
        $this.clearMap();
        $this.newPlaceMark(coordinates, false);

        if ($this.blocks.latitude && $this.blocks.longitude) {
            $this.blocks.latitude.val(coordinates[0]);
            $this.blocks.longitude.val(coordinates[1]);
        }
    };

    this.initClickEvent = function () {
        // Обработка события, возникающего при щелчке левой кнопкой мыши в любой точке карты.
        $this.map.events.add('click', clickEvent);
    };

    this.disableClickEvent = function () {
        $this.map.events.remove('click', clickEvent);
    };

    this.initSearchForm = function () {
        $(document).on('keyup', '#address-search', function (e) {
            e.preventDefault();
            $('#search-address-variants li').remove();

            var url_geocode = 'https://geocode-maps.yandex.ru/1.x/?apikey=583bbe5d-c554-4031-bbea-ce44ffaf8194',
                val = $(this).val(),
                keyCode = e.keyCode || e.which;

            if (val.length > 3 && keyCode !== 13) {
                $.ajax({
                    url: url_geocode + '&format=json&geocode=' + val,
                    success: function (response) {
                        $this.viewObjects(response.response.GeoObjectCollection.featureMember);
                    }
                });
            }
            return false;
        });

        $(document).on('change', '#address-search', function (e) {
            e.preventDefault();
            if ($(this).val().length) {
                cancelBtn.show();
            } else {
                cancelBtn.hide();
            }
            return false;
        });

        searchInput.parents('form:first').on('keyup keypress', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13 && e.target.name === 'search-address') {
                e.preventDefault();
                $this.searchByAddress($('#address-search').val());
                return false;
            }
        });

        $(document).on('click', '.search-address-variants-one, .search-address-variants-one a', function () {
            var address = $(this).text();
            $this.searchByAddress(address);
            $('#search-address-variants li').remove();
        });
    };

    this.initCancelButton = function () {
        cancelBtn.on('click', function () {
            $('#search-address-variants li').remove();
            $('#address-search').val('').change();
        });
    };

    this.viewObjects = function (objects) {
        objects.forEach(function (object) {
            var $object = object.GeoObject,
                text = $object.metaDataProperty.GeocoderMetaData.text;

            $('<li />').addClass('search-address-variants-one')
                .append($('<a />').text(text))
                .appendTo($('#search-address-variants'));
        });
    };

    this.getAddressOfCoordinates = function (coordinates) {
        this.getDataKindOfCoordinates(coordinates, '', function (res) {
            var geoObject = res.geoObjects.get(0),
                metaProps = geoObject.properties.get('metaDataProperty'),
                name = '';

            console.log(metaProps);

            if ($this.blocks.CountryName) {
                name = metaProps.GeocoderMetaData.AddressDetails.Country.CountryName;
                $this.blocks.CountryName.val(name);
            }

            if ($this.blocks.AdministrativeAreaName) {
                name = metaProps.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName;
                $this.blocks.AdministrativeAreaName.val(name);
            }

            if ($this.blocks.SubAdministrativeAreaName) {
                name = '';
                try {
                    name = metaProps.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.DependentLocality.DependentLocalityName;
                } catch (E) {
                    name = metaProps.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.SubAdministrativeAreaName;
                }

                $this.blocks.SubAdministrativeAreaName.val(name);
            }

            if ($this.blocks.LocalityName) {
                name = metaProps.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.SubAdministrativeArea.Locality.LocalityName;
                $this.blocks.LocalityName.val(name);
            }

            if ($this.blocks.street) {
                name = geoObject.getThoroughfare();
                $this.blocks.street.val(name);
            }

            if ($this.blocks.home) {
                var home = geoObject.getPremiseNumber();
                $this.blocks.home.val(home);
            }

            if ($this.blocks.cityName) {
                name = geoObject.properties.get('description');
                $this.blocks.cityName.val(name);
            }

            if ($this.blocks.address) {
                // name = geoObject.properties.get('name');
                name = metaProps.GeocoderMetaData.text;
                $this.blocks.address.val(name);
            }

            $('#address-search').val(metaProps.GeocoderMetaData.text).change();
        });
    };

    this.getDataKindOfCoordinates = function (coordinates, kind, callbackSuccess, callbackError) {
        ymaps.geocode(coordinates, {
            results: 1
            // kind: kind
        }).then(
            callbackSuccess,
            callbackError
        );
    };

    this.searchByAddress = function (search) {
        ymaps.geocode(search, {
            results: 1
        }).then(
            function (res) {
                var coordinates = res.geoObjects.get(0).geometry.getCoordinates();

                $this.clearMap();
                $this.newPlaceMark(coordinates, true);

                if ($this.blocks.latitude && $this.blocks.latitude.length) {
                    $this.blocks.latitude.val(coordinates[0]);
                }
                if ($this.blocks.longitude && $this.blocks.longitude.length) {
                    $this.blocks.longitude.val(coordinates[1]);
                }

                $this.getAddressOfCoordinates(coordinates); // Обновляем поля с адресами
            },
            function (err) {
                //console.log(err);
            }
        );
    };

    this.clearMap = function () {
        this.map.geoObjects.removeAll();
        $this.drawDistricts();
    };
}
