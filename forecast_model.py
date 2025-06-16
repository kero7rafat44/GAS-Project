import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import json
import warnings
warnings.filterwarnings('ignore')

# قراءة ملف الإكسل
excel_file = 'data.xlsx.xlsx'

# --- البيانات السنوية ---
try:
    annual_data = pd.read_excel(excel_file, sheet_name=0, nrows=10)
    print("أعمدة البيانات السنوية:", annual_data.columns)
    print("أول 5 صفوف من البيانات السنوية:\n", annual_data.head())
except Exception as e:
    print(f"خطأ في قراءة البيانات السنوية: {e}")
    annual_data = pd.DataFrame()

gases_annual = ['CO', 'No2', 'So2', 'TSP', 'Pm2.5', 'Pm10']
predictions = {'annual': {}}

if not annual_data.empty:
    # التنبؤات السنوية باستخدام الانحدار الخطي
    years = annual_data['Year'].values.reshape(-1, 1)
    for gas in gases_annual:
        y = annual_data[gas].values
        model = LinearRegression()
        model.fit(years, y)
        
        # التنبؤ للأعوام المستقبلية (2025 إلى 2030)
        future_years = np.array([[year] for year in range(2025, 2031)])
        future_preds = model.predict(future_years)
        
        # تخزين البيانات كسلاسل نصية لتجنب مشاكل التواريخ
        historical_data = [(str(int(year)), float(value)) for year, value in zip(annual_data['Year'], annual_data[gas])]
        future_data = [(str(int(year)), float(pred)) for year, pred in zip(future_years.flatten(), future_preds)]
        
        predictions['annual'][gas] = {
            'historical': historical_data,
            'future': future_data,
            'equation': f'y = {model.coef_[0]:.4f}x + {model.intercept_:.4f}'
        }

# حفظ التنبؤات في ملف JSON
with open('gas_predictions.json', 'w', encoding='utf-8') as f:
    json.dump(predictions, f, ensure_ascii=False, indent=2)

print("تم حفظ التنبؤات في gas_predictions.json")