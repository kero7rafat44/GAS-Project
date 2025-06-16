// تلوث العالمي
if (document.getElementById("map")) {
    if (typeof L === "undefined") {
        console.error("خطأ: لم يتم تحميل Leaflet. تأكدي من إضافة <script src='https://unpkg.com/leaflet/dist/leaflet.js'>");
    } else {
        // متغيرات لتخزين البيانات التاريخية واسم المنطقة
        let historicalData = [];
        let lastLocation = "";

        const map = L.map('map', {
            center: [27, 30], // مركز الخريطة
            zoom: 6,
            attributionControl: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

        // إضافة مستمع لزر تحميل Excel
        const downloadBtn = document.getElementById("downloadExcelBtn");
        if (downloadBtn) {
            downloadBtn.addEventListener("click", function() {
                console.log("البيانات التاريخية قبل التحميل:", historicalData);
                if (historicalData.length === 0) {
                    alert("لا توجد بيانات لتحميلها. يرجى جلب البيانات التاريخية أولاً.");
                    return;
                }
                downloadAsExcel(historicalData, lastLocation || "Unknown_Location");
            });
        } else {
            console.error("خطأ: زر تحميل Excel (downloadExcelBtn) غير موجود في DOM");
        }

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
            const location = document.getElementById("locationInput").value.trim();
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;

            if (!location) {
                document.getElementById("historyResult").innerHTML = "<p style='color: red;'>يرجى إدخال اسم المنطقة.</p>";
                return;
            }

            if (!startDate || !endDate) {
                document.getElementById("historyResult").innerHTML = "<p style='color: red;'>يرجى تحديد تاريخ البداية والنهاية.</p>";
                return;
            }

            const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
            const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

            if (startTimestamp < 1606348800) {
                document.getElementById("historyResult").innerHTML = "<p style='color: red;'>البيانات التاريخية متاحة فقط من 27 نوفمبر 2020.</p>";
                return;
            }

            // جلب إحداثيات المنطقة باستخدام OpenCage Geocoding API
            const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${geoApiKey}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        const { lat, lng } = data.results[0].geometry;
                        lastLocation = location; // تخزين اسم المنطقة
                        document.getElementById("historyResult").innerHTML = `
                            <p><strong>إحداثيات ${location}:</strong> <br> خط العرض: ${lat}, خط الطول: ${lng}</p>
                        `;
                        getPollutionData(lat, lng, null, startTimestamp, endTimestamp);
                    } else {
                        document.getElementById("historyResult").innerHTML = "<p style='color: red;'>لم يتم العثور على المنطقة.</p>";
                    }
                })
                .catch(error => {
                    console.error("خطأ في جلب إحداثيات المنطقة:", error);
                    document.getElementById("historyResult").innerHTML = "<p style='color: red;'>خطأ في جلب إحداثيات المنطقة.</p>";
                });
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

                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.toLocaleString('ar-EG', { month: 'long' });

                    output += `<h1>بيانات التلوث لشهر ${currentMonth} للعام ${currentYear}</h1>`;

                    if (start && end) {
                        historicalData = []; // إعادة تعيين البيانات التاريخية
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
                                    background-color: rgb(19, 18, 18);
                                }
                            </style>
                            <table>
                                <thead>
                                    <tr>
                                        <th>التاريخ والوقت</th>
                                        <th>جودة الهواء</th>
                                        <th>CO</th>
                                        <th></th>
                                        <th>NO₂</th>
                                        <th></th>
                                        <th>SO₂</th>
                                        <th></th>
                                        <th>O₃</th>
                                        <th></th>
                                        <th>PM2.5</th>
                                        <th></th>
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
                                    <td></td>
                                    <td>${no2} µg/m³</td>
                                    <td></td>
                                    <td>${so2} µg/m³</td>
                                    <td></td>
                                    <td>${o3} µg/m³</td>
                                    <td></td>
                                    <td>${pm2_5} µg/m³</td>
                                    <td></td>
                                    <td>${pm10} µg/m³</td>
                                </tr>
                            `;
                            historicalData.push({
                                "التاريخ والوقت": date,
                                "جودة الهواء": status.replace(/ ✅| 🟡| 🟠| 🔴| ☠️/, ""), // إزالة الرموز التعبيرية
                                "CO (µg/m³)": co,
                                "NO₂ (µg/m³)": no2,
                                "SO₂ (µg/m³)": so2,
                                "O₃ (µg/m³)": o3,
                                "PM2.5 (µg/m³)": pm2_5,
                                "PM10 (µg/m³)": pm10
                            });
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
                        console.log("البيانات التاريخية بعد الجلب:", historicalData);
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
                        historicalData = []; // إعادة تعيين البيانات في حالة الخطأ
                    } else {
                        document.getElementById("info").innerHTML = errorMsg;
                    }
                    if (layer && !start && !end) {
                        layer.setStyle({ color: "gray", fillColor: "gray", fillOpacity: 0.4 });
                        layer.bindPopup(errorMsg).openPopup();
                    }
                });
        }

        // دالة لتحميل البيانات كملف Excel
        function downloadAsExcel(data, location) {
            // التحقق من وجود مكتبة SheetJS
            if (typeof XLSX === "undefined") {
                console.error("خطأ: مكتبة SheetJS (xlsx) غير محملة. تأكد من إضافة <script src='https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js'> في pollution.html");
                alert("تعذر تحميل الملف. تأكد من تحميل مكتبة SheetJS.");
                return;
            }

            try {
                // التحقق من صحة البيانات
                if (!Array.isArray(data) || data.length === 0) {
                    console.error("خطأ: البيانات التاريخية غير صالحة أو فارغة:", data);
                    alert("البيانات غير صالحة. يرجى جلب البيانات مرة أخرى.");
                    return;
                }

                // تنظيف البيانات للتأكد من أن جميع القيم صالحة
                const cleanedData = data.map(item => {
                    const cleanedItem = {};
                    Object.keys(item).forEach(key => {
                        cleanedItem[key] = item[key] === null || item[key] === undefined ? "" : item[key];
                    });
                    return cleanedItem;
                });

                // إنشاء ورقة عمل
                const worksheet = XLSX.utils.json_to_sheet(cleanedData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Pollution Data");

                // تحديد عرض الأعمدة
                worksheet["!cols"] = [
                    { wch: 20 }, // التاريخ والوقت
                    { wch: 15 }, // جودة الهواء
                    { wch: 10 }, // CO
                    { wch: 10 }, // NO₂
                    { wch: 10 }, // SO₂
                    { wch: 10 }, // O₃
                    { wch: 10 }, // PM2.5
                    { wch: 10 }  // PM10
                ];

                // تنظيف اسم المنطقة لتجنب الأحرف غير الصالحة
                const cleanLocation = (location || "Unknown_Location").replace(/[^a-zA-Z0-9]/g, "_");
                const fileName = `Pollution_Data_${cleanLocation}_${new Date().toISOString().split('T')[0]}.xlsx`;

                // طريقة بديلة لتحميل الملف باستخدام Blob
                console.log("إنشاء ملف Excel مع اسم:", fileName);
                console.log("محتوى workbook:", workbook);
                const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                const blob = new Blob([wbout], { type: "application/octet-stream" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                console.log("تم تحميل ملف Excel بنجاح:", fileName);
                alert("تم تحميل الملف بنجاح!");
            } catch (error) {
                console.error("خطأ أثناء إنشاء ملف Excel:", error, error.stack);
                alert("حدث خطأ أثناء تحميل الملف: " + error.message + ". يرجى التحقق من وحدة التحكم لمزيد من التفاصيل.");
            }
        }
    }
}
