import pandas as pd

# 读取Excel文件
file_path = 'train data\data.xlsx'
df = pd.read_excel(file_path)

# 提取需要的列，假设列名为 'ColumnA' 和 'ColumnB'
columns_to_extract = ['emotion', 'title']
extracted_data = df[columns_to_extract]

# 强制将列转换为整数类型
for column in columns_to_extract:
    if extracted_data[column].dtype == 'float64':
        extracted_data[column] = extracted_data[column].astype('Int64')
        if column == 'emotion':  # 假设 'emotion' 列是标签列
            extracted_data[column] = extracted_data[column] + 1  # 将所有标签值加1

# 导出为txt文件
output_file_path = 'train data\data.txt'
extracted_data.to_csv(output_file_path, index=False, sep='\t')
