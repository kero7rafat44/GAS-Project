// منطق صفحة الغازات (gases.html)
if (document.getElementById("viewDiv")) {
    if (typeof require === "undefined") {
        console.error("خطأ: لم يتم تحميل ArcGIS JS API. تأكدي من إضافة <script src='https://js.arcgis.com/4.26/'> في gases.html");
    } else {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/TileLayer",
            "esri/layers/FeatureLayer",
            "esri/widgets/Legend"
        ], function(Map, MapView, TileLayer, FeatureLayer, Legend) {
            // إنشاء الخريطة بخلفية الأقمار الصناعية
            var map = new Map({
                basemap: "satellite"
            });

            // إضافة طبقة الحدود كـ Feature Layer (ستظهر على الخريطة فقط وليس في الـ Legend)
            var boundaryLayer = new FeatureLayer({
                url: "https://services1.arcgis.com/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp15_WFL1/FeatureServer", // استبدلي هذا بالرابط الفعلي
                title: "حدود المنطقة",
                listMode: "hide" // هذا يمنع ظهور الطبقة في الـ Legend
            });
            map.add(boundaryLayer); // طبقة الحدود تُضاف إلى الخريطة هنا وستظهر دائمًا

            // إعداد عرض الخريطة
            var view = new MapView({
                container: "viewDiv",
                map: map,
                center: [31.3667, 30.262], // إحداثيات القاهرة
                zoom: 13,
                constraints: {
                    minZoom: 5,
                    maxZoom: 30
                }
            });

            // إضافة مفتاح الخريطة
            var legend = new Legend({
                view: view,
                container: "legend"
            });

            // قائمة السنوات من 2015 إلى 2024
            var years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];

            // قائمة الطبقات المتاحة لكل غاز وسنة (Tile Layers)
            var layers = {
                "NO2_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2015_84_WTL1/MapServer", title: "NO₂ 2015" }),
                "NO2_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_16_84_WTL1/MapServer", title: "NO₂ 2016" }),
                "NO2_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_017_84_WTL1/MapServer", title: "NO₂ 2017" }),
                "NO2_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2018_WTL1/MapServer", title: "NO₂ 2018" }),
                "NO2_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2019_WTL1/MapServer", title: "NO₂ 2019" }),
                "NO2_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2020_WTL1/MapServer", title: "NO₂ 2020" }),
                "NO2_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_2021_84_WTL1/MapServer", title: "NO₂ 2021" }),
                "NO2_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/No2_22_WTL1/MapServer", title: "NO₂ 2022" }),
                "NO2_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/NO2_2023_1984_WTL1/MapServer", title: "NO₂ 2023" }),
                "NO2_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/no2_24_84_WTL1/MapServer", title: "NO₂ 2024" }),

                "CO_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_15_WTL1/MapServer", title: "CO 2015" }),
                "CO_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_16_WTL1/MapServer", title: "CO 2016" }),
                "CO_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_17_WTL1/MapServer", title: "CO 2017" }),
                "CO_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_18_WTL1/MapServer", title: "CO 2018" }),
                "CO_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_19_WTL1/MapServer", title: "CO 2019" }),
                "CO_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/CO_2020_WTL1/MapServer", title: "CO 2020" }),
                "CO_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/CO_2021_WTL1/MapServer", title: "CO 2021" }),
                "CO_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_22_WTL1/MapServer", title: "CO 2022" }),
                "CO_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/CO_23_1984_WTL1/MapServer", title: "CO 2023" }),
                "CO_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/co_24_WTL1/MapServer", }),

                "SO2_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/SO2_2015_84_WTL1/MapServer", title: "SO₂ 2015" }),
                "SO2_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so216_WTL1/MapServer", title: "SO₂ 2016" }),
                "SO2_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_17_WTL1/MapServer", title: "SO₂ 2017" }),
                "SO2_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_18_WTL1/MapServer", title: "SO₂ 2018" }),
                "SO2_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_19_WTL1/MapServer", title: "SO₂ 2019" }),
                "SO2_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_20_WTL1/MapServer", title: "SO₂ 2020" }),
                "SO2_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_21_84_WTL1/MapServer", title: "SO₂ 2021" }),
                "SO2_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_22_84_WTL1/MapServer", title: "SO₂ 2022" }),
                "SO2_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_23_84_WTL1/MapServer", title: "SO₂ 2023" }),
                "SO2_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/so2_24_84_WTL1/MapServer", title: "SO₂ 2024" }),

                "TSP_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp15_WTL1/MapServer", title: "TSP 2015" }),
                "TSP_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp16_WTL1/MapServer", title: "TSP 2016" }),
                "TSP_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp17_WTL1/MapServer", title: "TSP 2017" }),
                "TSP_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp18_WTL1/MapServer", title: "TSP 2018" }),
                "TSP_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp19_WTL1/MapServer", title: "TSP 2019" }),
                "TSP_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/Tsp_20_WTL1/MapServer", title: "TSP 2020" }),
                "TSP_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp21_WTL1/MapServer", title: "TSP 2021" }),
                "TSP_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp22_WTL1/MapServer", title: "TSP 2022" }),
                "TSP_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp23_WTL1/MapServer", title: "TSP 2023" }),
                "TSP_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/tsp24_WTL1/MapServer", title: "TSP 2024" }),
                
                "Pm10_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_15_WTL1/MapServer", title: "PM10 2015" }),
                "Pm10_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_16_WTL1/MapServer", title: "PM10 2016" }),
                "Pm10_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_17_WTL1/MapServer", title: "PM10 2017" }),
                "Pm10_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_18_WTL1/MapServer", title: "PM10 2018" }),
                "Pm10_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_19_WTL1/MapServer", title: "PM10 2019" }),
                "Pm10_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_20_WTL1/MapServer", title: "PM10 2020" }),
                "Pm10_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_21_WTL1/MapServer", title: "PM10 2021" }),
                "Pm10_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_22_WTL1/MapServer", title: "PM10 2022" }),
                "Pm10_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_23_WTL1/MapServer", title: "PM10 2023" }),
                "Pm10_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm10_24_WTL1/MapServer", title: "PM10 2024" }),

                "Pm2.5_2015": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_15_WTL1/MapServer", title: "PM2.5 2015" }),
                "Pm2.5_2016": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/ppm2_5_16_WTL1/MapServer", title: "PM2.5 2016" }),
                "Pm2.5_2017": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pppm2_5_17_WTL1/MapServer", title: "PM2.5 2017" }),
                "Pm2.5_2018": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pppm2_5_18_WTL1/MapServer", title: "PM2.5 2018" }),
                "Pm2.5_2019": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pppm2_5_19_WTL1/MapServer", title: "PM2.5 2019" }),
                "Pm2.5_2020": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/ppm2_5_20_WTL1/MapServer", title: "PM2.5 2020" }),
                "Pm2.5_2021": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/ppm2_5_21_WTL1/MapServer", title: "PM2.5 2021" }),
                "Pm2.5_2022": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_22_WTL1/MapServer", title: "PM2.5 2022" }),
                "Pm2.5_2023": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_23_WTL1/MapServer", title: "PM2.5 2023" }),
                "Pm2.5_2024": new TileLayer({ url: "https://tiles.arcgis.com/tiles/DJeqIQwJJ7wxtPdg/arcgis/rest/services/pm2_5_24_WTL1/MapServer", title: "PM2.5 2024" }),
            };

            var currentLayer = null; // متغير لتتبع طبقة الغاز الحالية
            var currentIndex = 0; // مؤشر السنة الحالية
            var animationTimer = null; // متغير لتتبع المؤقت

            // دالة لتحديث الخريطة بناءً على اختيار الغاز والسنة
            function updateMap() {
                var gas = document.getElementById("gasSelect").value;
                var yearIndex = parseInt(document.getElementById("yearSlider").value);
                var year = years[yearIndex];
                var layerKey = gas + "_" + year;

                // تحديث النص الذي يعرض السنة
                document.getElementById("yearValue").innerHTML = year;

                // تحديث القائمة المنسدلة للسنة
                document.getElementById("yearSelect").value = yearIndex;

                // إزالة طبقة الغاز الحالية إذا وجدت (لكن لا نؤثر على طبقة الحدود)
                if (currentLayer) {
                    map.remove(currentLayer);
                }

                // إعادة تعيين مفتاح الخريطة ليشمل طبقة الغاز فقط
                legend.layerInfos = [];

                // التحقق من وجود الطبقة المطلوبة
                if (layers[layerKey]) {
                    currentLayer = layers[layerKey];
                    map.add(currentLayer); // إضافة طبقة الغاز فوق طبقة الحدود
                    legend.layerInfos = [{ layer: currentLayer }]; // عرض طبقة الغاز فقط في الـ Legend
                    view.zoom = 13; // إعادة تعيين التكبير
                    document.getElementById("legend").style.display = "block";
                } else {
                    console.log("لا توجد طبقة متاحة لـ:", layerKey);
                    document.getElementById("legend").style.display = "none";
                }
            }

            // دالة لبدء التحريك التلقائي
            function startAnimation() {
                if (animationTimer) {
                    clearInterval(animationTimer);
                }
                animationTimer = setInterval(function() {
                    currentIndex++;
                    if (currentIndex > 9) { // عند الوصول إلى 2024
                        clearInterval(animationTimer);
                        animationTimer = null;
                        currentIndex = 0; // العودة إلى 2015
                        document.getElementById("yearSlider").value = currentIndex;
                        updateMap();
                        return;
                    }
                    document.getElementById("yearSlider").value = currentIndex;
                    updateMap();
                }, 2000); // تغيير كل ثانيتين
            }
            // دالة لإيقاف التحريك
            function pauseAnimation() {
                if (animationTimer) {
                    clearInterval(animationTimer);
                    animationTimer = null;
                }
            }

            // دالة لإيقاف التحريك وإعادة التعيين إلى 2015
            function stopAndReset() {
                if (animationTimer) {
                    clearInterval(animationTimer);
                    animationTimer = null;
                }
                currentIndex = 0;
                document.getElementById("yearSlider").value = currentIndex;
                document.getElementById("yearSelect").value = currentIndex; // تحديث القائمة المنسدلة
                updateMap();
            }

            // ربط الأحداث بالعناصر
            document.getElementById("gasSelect").addEventListener("change", updateMap);
            document.getElementById("yearSlider").addEventListener("input", function() {
                currentIndex = parseInt(this.value);
                updateMap();
            });
            document.getElementById("yearSelect").addEventListener("change", function() {
                currentIndex = parseInt(this.value);
                document.getElementById("yearSlider").value = currentIndex; // تحديث الشريط الزمني
                updateMap();
            });
            document.getElementById("startBtn").addEventListener("click", startAnimation);
            document.getElementById("pauseBtn").addEventListener("click", pauseAnimation);
            document.getElementById("stopResetBtn").addEventListener("click", stopAndReset);

            // تحديث الخريطة عند التحميل الأولي
            updateMap();
        });
    }
}
// منطق صفحة التلوث (pollution.html)
if (document.getElementById("map")) {
    if (typeof L === "undefined") {
        console.error("خطأ: لم يتم تحميل Leaflet. تأكدي من إضافة <script src='https://unpkg.com/leaflet/dist/leaflet.js'>");
    } else {
        var map = L.map("map").setView([30.2415, 31.411], 6);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        var drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: {
                polygon: true,
                rectangle: true,
                marker: false,
                polyline: false,
                circle: false,
                circlemarker: false
            }
        });
        map.addControl(drawControl);

        const geoApiKey = "3430bd3f5bfe4a7699ced0c351791d72";
        const pollutionApiKey = "76e0a0fdb041517937c0a13896db8fa9";

        let countryMarker;

        map.on('draw:created', function (e) {
            var type = e.layerType;
            var layer = e.layer;
            drawnItems.addLayer(layer);

            let center;
            if (type === 'rectangle') {
                center = layer.getBounds().getCenter();
            } else if (type === 'polygon') {
                let coords = layer.getLatLngs()[0];
                let latSum = 0, lngSum = 0, numPoints = coords.length;
                coords.forEach(coord => {
                    latSum += coord.lat;
                    lngSum += coord.lng;
                });
                center = L.latLng(latSum / numPoints, lngSum / numPoints);
            }

            if (center) {
                getPollutionData(center.lat, center.lng, layer);
            }
        });

        document.getElementById("searchBtn").addEventListener("click", function () {
            const country = document.getElementById("countryInput").value.trim();
            if (country === "") {
                document.getElementById("result").innerHTML = "<p style='color: red;'>يرجى إدخال اسم دولة.</p>";
                return;
            }

            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(country)}&key=${geoApiKey}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        const { lat, lng } = data.results[0].geometry;
                        document.getElementById("result").innerHTML = `
                            <p><strong>إحداثيات ${country}:</strong> <br> خط العرض: ${lat}, خط الطول: ${lng}</p>
                        `;
                        if (countryMarker) {
                            map.removeLayer(countryMarker);
                        }
                        countryMarker = L.marker([lat, lng]).addTo(map)
                            .bindPopup(`<strong>${country}</strong>`).openPopup();
                        map.setView([lat, lng], 13);
                        getPollutionData(lat, lng);
                    } else {
                        document.getElementById("result").innerHTML = "<p>لم يتم العثور على نتائج.</p>";
                    }
                })
                .catch(error => {
                    console.error("خطأ في جلب البيانات:", error);
                    document.getElementById("result").innerHTML = "<p style='color: red;'>خطأ في جلب البيانات.</p>";
                });
        });

        document.getElementById("fetchHistoryBtn").addEventListener("click", function () {
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;

            if (!startDate || !endDate) {
                document.getElementById("historyResult").innerHTML = "<p style='color: red;'>يرجى تحديد تاريخ البداية والنهاية.</p>";
                return;
            }

            const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
            const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

            if (startTimestamp < 1606348800) { // 27 نوفمبر 2020
                document.getElementById("historyResult").innerHTML = "<p style='color: red;'>البيانات التاريخية متاحة فقط من 27 نوفمبر 2020.</p>";
                return;
            }

            const lat = 30.04; // القاهرة (يمكنكِ تعديلها لتكون ديناميكية)
            const lon = 31.23;
            getPollutionData(lat, lon, null, startTimestamp, endTimestamp);
        });
        function getPollutionData(lat, lon, layer, start, end) {
            let url;
            if (start && end) {
                url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${pollutionApiKey}`;
            } else {
                url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${pollutionApiKey}`;
            }
        
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`خطأ HTTP! الحالة: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const list = start && end ? data.list : data.list;
                    let output = "";
        
                    // Get the current year and month in Arabic
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.toLocaleString('ar-EG', { month: 'long' });
        
                    // Add the year and month header
                    output += `<h1>بيانات التلوث لشهر ${currentMonth} للعام ${currentYear}</h1>`;
        
                    if (start && end) {
                        output += `
                            <style>
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                th, td {
                                    padding: 8px 12px;
                                    text-align: center;
                                    border: 1px solid #ddd;
                                }
                                th {
                                    background-color:rgb(19, 18, 18);
                                }
                                tr:nth-child(even) {
                                
                                }
                            </style>
                            <table>
                                <thead>
                                    <tr>
                                        <th>التاريخ والوقت</th>
                                        <th>جودة الهواء</th>
                                        <th>CO</th>
                                        <th></th> <!-- Empty column between gases -->
                                        <th>NO₂</th>
                                        <th></th> <!-- Empty column between gases -->
                                        <th>SO₂</th>
                                        <th></th> <!-- Empty column between gases -->
                                        <th>O₃</th>
                                        <th></th> <!-- Empty column between gases -->
                                        <th>PM2.5</th>
                                        <th></th> <!-- Empty column between gases -->
                                        <th>PM10</th>
                                    </tr>
                                </thead>
                                <tbody>
                        `;
                        list.forEach(item => {
                            const { main: { aqi }, components, dt } = item;
                            const { co, no2, so2, o3, pm2_5, pm10 } = components;
        
                            let status = "", color = "";
                            switch (aqi) {
                                case 1: status = "جيد ✅"; color = "green"; break;
                                case 2: status = "مقبول 🟡"; color = "yellow"; break;
                                case 3: status = "متوسط 🟠"; color = "orange"; break;
                                case 4: status = "غير صحي 🔴"; color = "red"; break;
                                case 5: status = "خطير ☠️"; color = "darkred"; break;
                                default: status = "غير معروف"; color = "gray";
                            }
        
                            const date = new Date(dt * 1000).toLocaleString("ar-EG");
                            output += `
                                <tr>
                                    <td>${date}</td>
                                    <td><span style="color:${color};">${status}</span></td>
                                    <td>${co} µg/m³</td>
                                    <td></td> <!-- Empty column between gases -->
                                    <td>${no2} µg/m³</td>
                                    <td></td> <!-- Empty column between gases -->
                                    <td>${so2} µg/m³</td>
                                    <td></td> <!-- Empty column between gases -->
                                    <td>${o3} µg/m³</td>
                                    <td></td> <!-- Empty column between gases -->
                                    <td>${pm2_5} µg/m³</td>
                                    <td></td> <!-- Empty column between gases -->
                                    <td>${pm10} µg/m³</td>
                                </tr>
                            `;
                        });
                        output += `</tbody></table>`;
                    } else {
                        const { main: { aqi }, components } = list[0];
                        const { co, no2, so2, o3, pm2_5, pm10 } = components;
        
                        let status = "", color = "";
                        switch (aqi) {
                            case 1: status = "جيد ✅"; color = "green"; break;
                            case 2: status = "مقبول 🟡"; color = "yellow"; break;
                            case 3: status = "متوسط 🟠"; color = "orange"; break;
                            case 4: status = "غير صحي 🔴"; color = "red"; break;
                            case 5: status = "خطير ☠️"; color = "darkred"; break;
                            default: status = "غير معروف"; color = "gray";
                        }
        
                        output = `
                            <h1>بيانات التلوث لشهر ${currentMonth} للعام ${currentYear}</h1>
                            <strong>جودة الهواء:</strong> <span style="color:${color};">${status}</span> <br>
                            <ul>
                                <li>أول أكسيد الكربون (CO): ${co} µg/m³</li>
                                <li>ثاني أكسيد النيتروجين (NO₂): ${no2} µg/m³</li>
                                <li>ثاني أكسيد الكبريت (SO₂): ${so2} µg/m³</li>
                                <li>الأوزون (O₃): ${o3} µg/m³</li>
                                <li>الجسيمات الدقيقة (PM2.5): ${pm2_5} µg/m³</li>
                                <li>الجسيمات العالقة (PM10): ${pm10} µg/m³</li>
                            </ul>
                        `;
                    }
        
                    if (start && end) {
                        document.getElementById("historyResult").innerHTML = output;
                    } else {
                        document.getElementById("info").innerHTML = output;
                    }
        
                    if (layer && !start && !end) {
                        const { main: { aqi }, components } = list[0];
                        const { co, no2, so2, o3, pm2_5, pm10 } = components;
                        let status = "", color = "";
                        switch (aqi) {
                            case 1: status = "جيد ✅"; color = "green"; break;
                            case 2: status = "مقبول 🟡"; color = "yellow"; break;
                            case 3: status = "متوسط 🟠"; color = "orange"; break;
                            case 4: status = "غير صحي 🔴"; color = "red"; break;
                            case 5: status = "خطير ☠️"; color = "darkred"; break;
                            default: status = "غير معروف"; color = "gray";
                        }
        
                        const popupContent = `
                            <strong>جودة الهواء:</strong> <span style="color:${color};">${status}</span> <br>
                            <ul style="padding-left: 20px; margin: 0;">
                                <li>CO: ${co} µg/m³</li>
                                <li>NO₂: ${no2} µg/m³</li>
                                <li>SO₂: ${so2} µg/m³</li>
                                <li>O₃: ${o3} µg/m³</li>
                                <li>PM2.5: ${pm2_5} µg/m³</li>
                                <li>PM10: ${pm10} µg/m³</li>
                            </ul>
                        `;
                        layer.setStyle({ color, fillColor: color, fillOpacity: 0.4 });
                        layer.bindPopup(popupContent).openPopup();
                    }
                })
                .catch(error => {
                    console.error("خطأ في جلب بيانات التلوث:", error);
                    const errorMsg = "<p style='color: red;'>تعذر جلب بيانات التلوث!</p>";
                    if (start && end) {
                        document.getElementById("historyResult").innerHTML = errorMsg;
                    } else {
                        document.getElementById("info").innerHTML = errorMsg;
                    }
                    if (layer && !start && !end) {
                        layer.setStyle({ color: "gray", fillColor: "gray", fillOpacity: 0.4 });
                        layer.bindPopup(errorMsg).openPopup();
                    }
                });
        }
        
    }
}