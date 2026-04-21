import streamlit as st
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

# 加载模型配置和模型
model_dir = snapshot_download('tiansz/bert-base-chinese')
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = BertForSequenceClassification.from_pretrained(model_dir, num_labels=3)
model.load_state_dict(torch.load('model.pth'))

def seg(commentdf):
    comment_list = []
    for i in range(len(commentdf)):
        comment_list.append(jieba.lcut(commentdf['title'][i]))

    for j in range(len(comment_list)):
        comment_list[j] = ' '.join(comment_list[j])

    comment_list = pd.DataFrame(comment_list, columns=['segmented_title'])
    comment_list['time'] = commentdf['time']
    
    return comment_list

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

def plot_sentiments(comments):
    current_year = datetime.now().year
    comments['time'] = pd.to_datetime(comments['time'].apply(lambda x: f"{current_year}-{x}"), format='%Y-%m-%d %H:%M')
    daily_sentiments = comments.groupby([comments['time'].dt.date, 'sentiment']).size().unstack(fill_value=0)

    plt.figure(figsize=(12, 6))
    daily_sentiments.plot(kind='bar', stacked=True, ax=plt.gca())
    plt.title('Daily Sentiment Analysis')
    plt.xlabel('Date')
    plt.ylabel('Number of Comments')
    plt.xticks(rotation=45)
    plt.legend(title='Sentiment')
    plt.tight_layout()
    plt.savefig('sentiment_plot.png')
    return 'sentiment_plot.png'

def main():
    st.title("股吧评论情感分析")
    
    stock_code = st.text_input("请输入股票代码:", value='000000')
    max_page = st.number_input("请输入想要查询的页数:", min_value=1, max_value=100, value=10)
    
    if st.button("开始分析"):
        all_title = []
        all_time = []

        # 爬取数据
        for page in range(1, max_page + 1):
            url = f'https://gubaf10.eastmoney.com/list,{stock_code}_{page}.html'
            data = requests.get(url, timeout=10, headers=headers)
            data.encoding = 'utf-8'
            
            data_e = etree.HTML(data.text)

            # 使用实际页面结构中的XPath路径
            title = data_e.xpath("//div[@class='articleh normal_post']//span[@class='l3 a3']/a/text()")
            time = data_e.xpath("//div[@class='articleh normal_post']//span[@class='l5 a5']/text()")
            
            all_title += title
            all_time += time

        comment_data = pd.DataFrame({
            'title': all_title,
            'time': all_time
        })

        segmented_comments = seg(comment_data)
        segmented_comments['sentiment'] = sentiment_analysis(segmented_comments)
        
        plot_path = plot_sentiments(segmented_comments)
        
        st.success("分析完成！")
        st.image(plot_path, caption='Daily Sentiment Analysis')

if __name__ == '__main__':
    main()
