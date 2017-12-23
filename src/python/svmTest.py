import numpy as np
import ast
import mysql.connector
from sklearn import datasets, svm, metrics

#make a connection
cnx = mysql.connector.connect(user='HoGUser',password='hog4fun',host='127.0.0.1',database='HoG')
cursor = cnx.cursor()

#take all the data
query = ("SELECT * FROM feature_and_class")
cursor.execute(query)

#store in a blob
temp_trained_data = []
temp_trained_class = []

for (id, classifier, feature, dt) in cursor:
        temp_trained_data.extend(["{}".format(feature)])
        temp_trained_class.extend(["{}".format(classifier)])

#connection is no longer useful so, terminate connection.
cursor.close()
cnx.close()

#convert string blobs into arrays of floats
trained_data = []
for i in temp_trained_data:
        temp = list(ast.literal_eval(i))
        trained_data.append(temp)

#call svm library
classifier = svm.SVC(gamma=0.001)
X =  trained_data
Y =  np.array(temp_trained_class)
classifier.fit(X,Y)

#provide prediction
test = [trained_data[0]]
print(classifier.predict(test))