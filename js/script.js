; (function () {
    'use strict';

    var cityId = 625144;
    // var cityName = 'Minsk,by';
    var urlWeather = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityId
        + '&units=metric&lang=ru'
        + '&APPID=43c7a12488a6acfc84d986708d2a0504'; // current weather

    var urlForecast = 'http://api.openweathermap.org/data/2.5/forecast?id=' + cityId
        + '&units=metric&lang=ru'
        + '&APPID=43c7a12488a6acfc84d986708d2a0504'; // weather forecast


    window.load(urlWeather, createWeatherNow);

    /**
     * Create weather now widget and weather forecast items
     * @param data
     */
    function createWeatherNow(data) {
        // console.log(' WeatherNow data ' + JSON.stringify(data));

        // Help data view
     /*   var  WeatherNowData = {
            "coord":
                {
                    "lon":27.57,
                    "lat":53.9
                },
            "weather":[
                {
                    "id":600,
                    "main":"Snow",
                    "description":"light snow",
                    "icon":"13d"
                }
                ],
            "base":"stations",
            "main":
                {
                    "temp":271.15,
                    "pressure":1033,
                    "humidity":79,
                    "temp_min":271.15,
                    "temp_max":271.15
                },
            "visibility":10000,
            "wind":
                {
                    "speed":4,
                    "deg":60
                },
            "clouds":{"all":90},
            "dt":1515745800,
            "sys":
                {
                    "type":1,
                    "id":7377,
                    "message":0.0038,
                    "country":"BY",
                    "sunrise":1515738137,
                    "sunset":1515766463
                },
            "id":625144,
            "name":"Minsk",
            "cod":200
        }
*/
        if ('content' in document.createElement('template')) {
            var weatherItem = document.getElementById('weatherNowTemplate');
            var clone = document.importNode(weatherItem.content, true);

            clone.querySelector('.weather-now__temp').innerHTML = Math.round(data.main.temp) + '°C';
            clone.querySelector('.weather-now__date').innerHTML =  dateToStrig(new Date());
            clone.getElementById('weatherNowHumidity').innerHTML = Math.round(data.main.humidity);
            clone.getElementById('weatherNowWind').innerHTML = data.wind.speed ? Math.round(data.wind.speed) : 'Штиль';

            var weatherDesc = data.weather[0].description;
            clone.getElementById('weatherNowDesc').innerHTML = capitalizeFirstLetter(weatherDesc);

            document.getElementById('weatherNowWrap').appendChild(clone);
        }

        window.load(urlForecast, createWeatherItems);
    }

    /**
     * Create weather items
     * @param data
     */
    function createWeatherItems(data) {
        // console.log('data ' + JSON.stringify(data));

        var firstDate = new Date();
        firstDate = firstDate.getDate() + 1;
        var forecasts = [];
        var COUNTDAYS = 4;

        for (var i = 0; i < COUNTDAYS; i++) {
            var forecast = getForecastForDate(firstDate + i);
            var newForecast = {}
            newForecast['forecast' + i] = forecast;
            forecasts.push(newForecast);
        }
        // console.log('forecasts ' + JSON.stringify(forecasts));

        /*******************************/
        // Help data view
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

        setTimeout(function() {
            document.querySelector('.weather').classList.add('weather--show');
        }, 500);


        /**********************************/

        function createWeatherItems (arrayItems) {
            var weather = document.getElementById('weather');
            for (var i = 0; i < COUNTDAYS; i++) {
                var itemNight = arrayItems[i]['forecast' + i][0];
                var itemDay = arrayItems[i]['forecast' + i][1];
                // console.log('item ' + JSON.stringify(itemDay));

                if ('content' in document.createElement('template')) {
                    var weatherItem = document.getElementById('weatherItemTemplate');
                    var clone = document.importNode(weatherItem.content, true);

                    clone.querySelector('.weather__date').innerHTML = dateToStrig(new Date(itemNight.dt_txt)).replace(',', '<br>');;
                    clone.querySelector('.weather__tempMin').innerHTML = Math.round(itemNight.main.temp);
                    clone.querySelector('.weather__tempMax').innerHTML = Math.round(itemDay.main.temp);
                    clone.querySelector('.weather__desc').innerHTML = capitalizeFirstLetter(itemDay.weather[0].description);
                    clone.querySelector('.weather__img img').setAttribute('src', 'https://openweathermap.org/img/w/' + itemDay.weather[0].icon + '.png');

                    weather.appendChild(clone);

                }
            };
        }

        /**
         *
         * @param {number} date - day for filtering
         * @returns {Array} - Filtered array according hoursArray
         */
        function getForecastForDate(date) {
            var hoursArray = [0, 15];

            var outForecast = data.list.filter(function(item) {
                var itemDate = new Date(item.dt_txt);
                return ((itemDate.getDate() == date) &&
                (hoursArray.indexOf(itemDate.getHours()) !== -1 ) );
            });

            return outForecast;
        }

    }

    /**
     *
     * @param {Date} date
     * @returns {string} - Date converted to string according inside options
     */
    function dateToStrig(date) {
        var options = {
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };

        var outDate = date.toLocaleString('ru', options);

        return capitalizeFirstLetter(outDate);
    }

    /**
     *
     * @param {string} str
     * @returns {string} - String with capitalize first letter
     */
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.substr(1);
    }
})();