import mysql.connector
cnx = mysql.connector.connect(user='HoGUser', password='hog4fun',host='127.0.0.1',database='HoG')
cursor = cnx.cursor()

query = ("SELECT * FROM feature_and_class")
cursor.execute(query)

for (id, classifier, feature, dt) in cursor:
	print("{}, {}, {:%d %b %Y}".format(id,classifier,dt))

cursor.close()
cnx.close()