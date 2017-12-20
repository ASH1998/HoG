from pprint import pprint
import numpy as np
np.set_printoptions(threshold='nan')
from sklearn import datasets, svm, metrics
import csv

training_data = []
files = [ "dataset_01.csv", "dataset_02.csv", "dataset_03f.csv", "dataset_04.csv", "dataset_05.csv", "dataset_06.csv", "dataset_07f.csv", "dataset_08f.csv", "dataset_09f.csv", "dataset_10f.csv" ]
for i in files:
	temp = []
	parser = csv.reader(open(i), delimiter=',',quoting=csv.QUOTE_NONNUMERIC)
	for l in parser: temp.extend(l)
	training_data.append(temp)
	
test_data = []
temp = []
parser = csv.reader(open("dataset_11f.csv"), delimiter=',',quoting=csv.QUOTE_NONNUMERIC)
for l in parser: temp.extend(l)
test_data.append(temp)

classifier = svm.SVC(gamma=0.001)
X =  training_data
Y =  np.array(["Face", "Face", "Not a face", "Face", "Face", "Face", "Not a face", "Not a face", "Not a face", "Not a face"])
classifier.fit(X,Y)

print(classifier.predict(test_data))