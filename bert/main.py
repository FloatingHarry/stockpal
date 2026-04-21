import requests
from lxml import etree
import pandas as pd
import jieba
from transformers import AutoTokenizer, BertForSequenceClassification
import torch
import matplotlib.pyplot as plt
from datetime import datetime
from modelscope import snapshot_download

# 设置请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

all_title = []
all_time = []

max_page = 5  # 设置你想爬取的最大页数

# 爬取数据
for page in range(1, max_page + 1):
    url = f'https://gubaf10.eastmoney.com/list,002085_{page}.html'
    data = requests.get(url, timeout=10, headers=headers)
    # 设置编码，防止出现乱码
    data.encoding = 'utf-8'
    
    data_e = etree.HTML(data.text)

    # 使用实际页面结构中的XPath路径
    title = data_e.xpath("//div[@class='articleh normal_post']//span[@class='l3 a3']/a/text()")
    time = data_e.xpath("//div[@class='articleh normal_post']//span[@class='l5 a5']/text()")
    
    all_title += title
    all_time += time

# 将爬取的数据保存到一个 pandas DataFrame 中
comment_data = pd.DataFrame({
    'title': all_title,
    'time': all_time
})

# 将爬取的数据保存到 TXT 文件
comment_data.to_csv('test data/data.txt', index=False, sep='\t', encoding='utf-8-sig')

# 分词处理函数
def seg(commentdf):
    comment_list = []
    for i in range(len(commentdf)):
        comment_list.append(jieba.lcut(commentdf['title'][i]))

    for j in range(len(comment_list)):
        comment_list[j] = ' '.join(comment_list[j])

    comment_list = pd.DataFrame(comment_list, columns=['segmented_title'])
    comment_list['time'] = commentdf['time']  # 保留时间列
    
    return comment_list

# 对爬取的评论数据进行分词
segmented_comments = seg(comment_data)

# 将有时间列的分词后的数据保存到 TXT 文件
segmented_comments.to_csv('test data/stock_comments_seg.txt', index=False, sep='\t', encoding='utf-8-sig')

# 加载模型配置和模型
model_dir = snapshot_download('tiansz/bert-base-chinese')
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = BertForSequenceClassification.from_pretrained(model_dir,num_labels=3)
model.load_state_dict(torch.load('model.pth'))

# 情感分析函数
def sentiment_analysis(comments):
    sentiments = []
    for comment in comments['segmented_title']:
        inputs = tokenizer(comment, return_tensors='pt', truncation=True, padding=True, max_length=512)
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()
        if prediction == 2:
            sentiments.append('positive')
        elif prediction == 1:
            sentiments.append('neutral')
        else:
            sentiments.append('negative')
    return sentiments

# 对分词后的评论数据进行情感分析
segmented_comments['sentiment'] = sentiment_analysis(segmented_comments)

# 将带有情感分析结果的数据保存到 TXT 文件
segmented_comments.to_csv('test data/stock_comments_sentiment.txt', index=False, sep='\t', encoding='utf-8-sig')

# 处理时间数据，假设所有时间都是当年的时间
current_year = datetime.now().year
segmented_comments['time'] = pd.to_datetime(segmented_comments['time'].apply(lambda x: f"{current_year}-{x}"), format='%Y-%m-%d %H:%M')

# 按天和情感进行聚合
daily_sentiments = segmented_comments.groupby([segmented_comments['time'].dt.date, 'sentiment']).size().unstack(fill_value=0)

# 画图
plt.figure(figsize=(12, 6))
daily_sentiments.plot(kind='bar', stacked=True, ax=plt.gca())
plt.title('Daily Sentiment Analysis')
plt.xlabel('Date')
plt.ylabel('Number of Comments')
plt.xticks(rotation=45)
plt.legend(title='Sentiment')
plt.tight_layout()
plt.show()
