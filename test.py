number = [9, 2, 7, 3, 7, 9, 2]
dict_data = {}

for i in number:
    if i in dict_data:
        dict_data[i] = dict_data[i] + 1
    else:
        dict_data[i] = 1

print(dict_data)
