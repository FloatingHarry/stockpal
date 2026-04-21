# %%
import torch
from transformers import AutoTokenizer,AutoModel, AdamW
from torch.utils.data import DataLoader, Dataset, random_split
import pandas as pd
from tqdm import tqdm
import random
from transformers import BertForSequenceClassification

# %%
from modelscope import snapshot_download
model_dir = snapshot_download('tiansz/bert-base-chinese')

# %%
# 加载预训练的BERT模型和分词器
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = BertForSequenceClassification.from_pretrained(model_dir,num_labels=3)

# %%
class SentimentDataset(Dataset):
    def __init__(self, dataframe, tokenizer, max_length=128):
        self.dataframe = dataframe
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        text = self.dataframe.iloc[idx]['review']
        label = self.dataframe.iloc[idx]['label']
        encoding = self.tokenizer(text, padding='max_length', truncation=True, max_length=self.max_length, return_tensors='pt')
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),  
            'labels': torch.tensor(label, dtype=torch.long)
    }

# %%
with open("train data\data.txt", "r", encoding="utf-8") as file:
    lines = file.readlines()

data = []
for line in lines:
    parts = line.strip().split("\t")
    if len(parts) == 2:
        label, text = parts
        data.append((int(label), text))
    else:
        # 可以选择记录错误、跳过该行或采取其他措施
        print(f"Skipping line due to unexpected format: {line}")

df = pd.DataFrame(data, columns=["label", "review"])

dataset = SentimentDataset(df, tokenizer, max_length=128)

# 划分训练集和验证集
train_size = int(0.85 * len(dataset))
val_size = len(dataset) - train_size
train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

# 创建数据加载器
train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=8, shuffle=False)

# %%
# 设置训练参数
optimizer = AdamW(model.parameters(), lr=1e-5)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# %%
# 训练模型
model.train()
for epoch in range(3):
    for batch in tqdm(train_loader, desc="Epoch {}".format(epoch + 1)):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)

        optimizer.zero_grad()
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        loss.backward()
        optimizer.step()

# %%
torch.save(model.state_dict(), 'model.pth')

# %%
# 验证集下评估模型
model.eval()
total_eval_accuracy = 0
for batch in tqdm(val_loader, desc="Evaluating"):
    input_ids = batch['input_ids'].to(device)
    attention_mask = batch['attention_mask'].to(device)
    labels = batch['labels'].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        logits = outputs.logits
        preds = torch.argmax(logits, dim=1)
        accuracy = (preds == labels).float().mean()
        total_eval_accuracy += accuracy.item()

average_eval_accuracy = total_eval_accuracy / len(val_loader)
print("Validation Accuracy:", average_eval_accuracy)


# %%
# 使用微调后的模型进行预测
def predict_sentiment(sentence):
    inputs = tokenizer(sentence, padding='max_length', truncation=True, max_length=128, return_tensors='pt').to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    probs = torch.softmax(logits, dim=1)
    return probs[0]  # 返回所有类别的概率

def predict(sentence):
    probs = predict_sentiment(sentence)
    label = torch.argmax(probs).item()  # 获取最高概率的索引作为预测标签
    if label == 2:
        print("正面")
    elif label == 1:
        print("中性")
    else:
        print("负面")

predict("中原海控太强了")

# %%
import torch
from torch.utils.data import Dataset

# 定义用于加载测试数据集的类
class TestDataset(Dataset):
    def __init__(self, file_path, tokenizer, max_length=128):
        self.data = []
        with open(file_path, "r", encoding="utf-8") as file:
            for line in file:
                label, text = line.strip().split("\t")
                self.data.append((int(label), text))
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        label, text = self.data[idx]
        encoding = self.tokenizer(text, padding='max_length', truncation=True, max_length=self.max_length, return_tensors='pt')
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

# 加载测试数据集
test_dataset = TestDataset("train data\\test.txt", tokenizer, max_length=128)
test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=8, shuffle=False)

# 评估模型
model.eval()
total_eval_accuracy = 0
for batch in tqdm(test_loader, desc="Evaluating"):
    input_ids = batch['input_ids'].to(device)
    attention_mask = batch['attention_mask'].to(device)
    labels = batch['labels'].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
    
    logits = outputs.logits
    preds = torch.argmax(logits, dim=1)
    accuracy = (preds == labels).float().mean()
    total_eval_accuracy += accuracy.item()

average_eval_accuracy = total_eval_accuracy / len(test_loader)
print("Test Accuracy:", average_eval_accuracy)



