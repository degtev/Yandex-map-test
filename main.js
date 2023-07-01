ymaps.ready(init);

function init() {
    var zoomInToMap = 12;   // Зум карты при инициализации
    var map = new ymaps.Map("map", {
        center: [45.035470, 38.975313],
        zoom: zoomInToMap,
        controls: ['zoomControl'],  // Включение только элемента управления масштабированием
    });

    // Рисуем полигон вокруг города
    var polygon = new ymaps.Polygon([
        [
            [45.010335, 39.014548],
            [45.010335, 38.938078],
            [45.051606, 38.938078],
            [45.051606, 39.014548]
        ]
    ], {}, {
        fillColor: '#00FF00',
        fillOpacity: 0.3,
        strokeColor: '#0000FF',
        strokeWidth: 1,
        strokeOpacity: 0.3,
        interactivityModel: 'default#transparent',  // Модель взаимодействия с полигоном
    });

    map.geoObjects.add(polygon);

    // Обработчик события клика по карте
    map.events.add('click', function (e) {
        var coords = e.get('coords');   // Получение координат места клика
        var address = ymaps.geocode(coords).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            var addressFields = firstGeoObject.getAddressLine();    // Получение полного адреса по координатам

            // Обновление полей формы с информацией о месте клика
            updateFields(addressFields, firstGeoObject.getLocalities()[0], firstGeoObject.getThoroughfare(), firstGeoObject.getPremiseNumber(), coords);

            // Проверка, находятся ли координаты внутри полигона
            if (isInsidePolygon(coords)) {
                console.log('Клик внутри полигона');
                $("#message").html('Клик внутри полигона');
            } else {
                console.log('Клик вне полигона');
                $("#message").html('Клик вне полигона');
            }
        });

        addGeoObjectsToMap(coords,polygon); // Добавление геообъектов на карту при клике
    });

    // Создание предложений при вводе адреса
    var suggestView = new ymaps.SuggestView('address', { boundedBy: map.getBounds() });
    suggestView.events.add('select', function (e) {
        var item = e.get('item');
        ymaps.geocode(item.value).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            var addressFields = firstGeoObject.getAddressLine();
            var coords = firstGeoObject.geometry.getCoordinates();
            updateFields(addressFields, firstGeoObject.getLocalities()[0], firstGeoObject.getThoroughfare(), firstGeoObject.getPremiseNumber(), coords);
            addGeoObjectsToMap(coords,polygon);
            map.setCenter(coords, zoomInToMap);
        });
    });

    // Функция для проверки, находятся ли координаты внутри полигона
    function isInsidePolygon(coords) {
        return polygon.geometry.contains(coords);
    }

    // Функция для добавления геообъектов на карту
    function addGeoObjectsToMap(coords,polygon) {
        map.geoObjects.removeAll();
        map.geoObjects.add(polygon);
        map.geoObjects.add(new ymaps.Placemark(coords, {}, { hasBalloon: false }));;
    }

    // Функция для обновления полей формы с информацией о месте клика
    function updateFields(address, city, street, house, coordinates) {
        document.getElementById('address').value = address;
        document.getElementById('city').value = city || '';
        document.getElementById('street').value = street || '';
        document.getElementById('house').value = house || '';
        document.getElementById('coordinates').value = coordinates.join(', ');
    }
}