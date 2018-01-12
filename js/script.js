; (function () {
    'use strict';

    var cityId = 625144;
    // var cityName = 'Minsk,by';
    // var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&type=like&APPID=43c7a12488a6acfc84d986708d2a0504';
    var urlWeather = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&APPID=43c7a12488a6acfc84d986708d2a0504'; // current weather

    var urlForecast = 'http://api.openweathermap.org/data/2.5/forecast?id=' + cityId
            + '&units=metric'
        + '&APPID=43c7a12488a6acfc84d986708d2a0504'; // weather forecast


    window.load(urlForecast, onLoad);

    function onLoad(data) {
        // console.log('data ' + JSON.stringify(data));

        var firstDate = new Date(data.list[0].dt_txt);
        var forecasts = [];
        var COUNTDAYS = 3;

        for (var i = 0; i < COUNTDAYS; i++) {
            var forecast = getForecastForDate(firstDate.getDate() + i);
            var newForecast = {}
            newForecast['forecast' + i] = forecast;
            forecasts.push(newForecast);
        }
        // console.log('forecasts ' + JSON.stringify(forecasts));


        function dateToStrig(date) {
            var options = {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            };

            var outDate = date.toLocaleString('ru', options);
            outDate = outDate.charAt(0).toUpperCase() + outDate.substr(1);
            console.log(outDate);
            return outDate;
        }
        /*******************************/

        var out = {
            "dt":1515542400,
            "main":
                {
                    "temp":-3.22,
                    "temp_min":-3.22,
                    "temp_max":-3.22,
                    "pressure":1014.74,
                    "sea_level":1045.63,
                    "grnd_level":1014.74,
                    "humidity":94,
                    "temp_kf":0
                },
            "weather":
                [
                    {
                        "id":800,
                        "main":"Clear",
                        "description":"clear sky",
                        "icon":"01n"
                    }
                ],
            "clouds":
                {
                    "all":44
                },
            "wind":
                {
                    "speed":2.98,
                    "deg":284.5
                },
            "rain":{},
            "snow":{
                "3h":0.01825
            },
            "sys":{
                "pod":"n"
            },
            "dt_txt":"2018-01-10 00:00:00"
        }


        /*******************************/

        createWeatherItems(forecasts);

        function createWeatherItems (arrayItems) {
            var weather = document.getElementById('weather');
            for (var i = 0; i < COUNTDAYS; i++) {
                var item = arrayItems[i]['forecast' + i][0];
                console.log('item ' + JSON.stringify(item));

                if ('content' in document.createElement('template')) {
                    var weatherItem = document.getElementById('weatherItem');
                    var clone = document.importNode(weatherItem.content, true);

                    clone.querySelector('.weather__date').innerHTML = dateToStrig(new Date(item.dt_txt));
                    clone.querySelector('.weather__text').innerHTML = item.weather[0].description;
                    clone.querySelector('.weather__img img').setAttribute('src', 'https://openweathermap.org/img/w/' + item.weather[0].icon + '.png');

                    createWeatherDescItems (arrayItems[i]['forecast' + i], clone);
                    weather.appendChild(clone);

                }
            };
        }

        function createWeatherDescItems (arrayItems, parentElem) {
            arrayItems.forEach(function(item){

                if ('content' in document.createElement('template')) {
                    var weatherDescItem = document.getElementById('weatherDescItem');
                    var clone = document.importNode(weatherDescItem.content, true);

                    var hours = new Date(item.dt_txt).getHours();
                    clone.querySelector('.weather__time').innerHTML = getTimeDesc(hours);
                    clone.querySelector('.weather__temp').innerHTML = Math.round(item.main.temp) + '°C';
                    clone.querySelector('.weather__wind').innerHTML = item.wind.speed ? item.wind.speed + ' м/с' : 'штиль';
                    clone.querySelector('.weather__pressure').innerHTML = Math.round(item.main.pressure) + ' мм.рт.с.';
                    clone.querySelector('.weather__humidity').innerHTML = item.main.humidity + '%';

                    parentElem.querySelector('.weather__desc').appendChild(clone);
                }
            });
        }


        /**
         * Create time decription
         * @param {number} hours - Hours for time decription
         * @returns {sting} - time decription
         */
        function getTimeDesc(hours) {
            var timeDesc = {
                0: 'ночью',
                6: 'утром',
                12: 'днем',
                21: 'вечером'
            };

            for (var key in timeDesc) {
                if ( key === hours.toString() ) {
                    return timeDesc[key];
                }
            }

        }

        /**
         *
         * @param {number} date - day for filtering
         * @returns {Array} - Filtered array according hoursArray
         */
        function getForecastForDate(date) {
            var hoursArray = [0, 6, 12, 21];

            var outForecast = data.list.filter(function(item) {
                var itemDate = new Date(item.dt_txt);
                return ((itemDate.getDate() == date) &&
                (hoursArray.indexOf(itemDate.getHours()) !== -1 ) );
            });

            return outForecast;
        }

    }
})();