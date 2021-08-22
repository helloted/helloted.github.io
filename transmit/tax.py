#coding=utf-8

#当月个税 = (累计收入-累计五险一金-累计减除费用)*预扣税率-速算扣除数-累计已缴税额
#社保=医保基数*2% + 6.60(失业) + 1387.68(养老保险)
#公积金年医保基数最大为25044*0.12=3005，2019年为27927*0.12=3351
#2019医保27927*0.02=558
#2019养老保险基数最大为广大最大19014*0.08=1521



#2020医保31938*0.02=638.76
#失业6.6
#2020养老保险基数最大为广大最大20268*0.08=1621
#社保=医保基数*2% + 6.60(失业) + 1387.68(养老保险)=638+6.6+1621=2265
#住房公积金2020年最高为为31938*0.12=3832


def cau_total(pre_toal):
    if pre_toal <= 36000:
        return [0.03,0]
    if pre_toal > 36000 and pre_toal <= 144000:
        return [0.1,2520]
    if pre_toal > 144000 and pre_toal <= 300000:
        return [0.2,16920]
    if pre_toal > 300000 and pre_toal <= 420000:
        return [0.25,31920]
    if pre_toal > 420000 and pre_toal <= 660000:
        return [0.3,52920]
    if pre_toal > 660000 and pre_toal <= 960000:
        return [0.35,85920]
    if pre_toal > 960000 :
        return [0.45,181920]

def sum_arr(arr,num):
    sum=0
    for i in range(0,num):
        sum += arr[i]
    return sum


def year_total(pay):
    mon_pay = pay/12
    tax = 0
    if mon_pay <= 3000:
        tax = 0
    elif mon_pay > 3000 and mon_pay <= 12000:
        tax = pay * 0.10 - 210
    elif mon_pay > 12000 and mon_pay <= 25000:
        tax = pay * 0.20 - 1410
    elif mon_pay > 25000 and mon_pay <= 35000:
        tax = pay * 0.25 - 2660
    
    my_get = pay - tax

    print '年终税前:{},税:{},税后年终:{}'.format(pay,tax,my_get)

    return my_get




if __name__ == "__main__":
    
    # pay_arr = [25000,25000,25565,25000,26720,26720,26720,26720,26720,26720,30190,30190]
    # jijin_arr = [5506,5506,5506,5506,5506,4894,4894,5037,5037,5037,5037,5037]
    # tax_arr = []
    # for i in range(0,len(pay_arr)):
    #     mon = i + 1
    #     pay = pay_arr[i]
    #     jijin = jijin_arr[i]
    #     pay_toal = sum_arr(pay_arr,mon)
    #     jijin_total = sum_arr(jijin_arr,mon)
    #     pre_total = pay_toal - jijin_total - 5000 * mon
    #     index = cau_total(pre_total)
    #     tax = pre_total * index[0] - index[1] - sum_arr(tax_arr,len(tax_arr))
    #     my_input = pay - jijin - tax
    #     tax_arr.append(tax)
    #     print '2019年{}月 税:'.format(mon) + str(tax) + ' 税收收入:' + str(my_input)
    # print '<=======>'

    
    # pay_arr_2020 = [30190,30190,30190]
    # jijin_arr_2020 = [5037,5037,5037]
    # tax_arr_2020 = []
    # for i in range(0,len(pay_arr_2020)):
    #     mon = i + 1
    #     pay = pay_arr_2020[i]
    #     jijin = jijin_arr_2020[i]
    #     pay_toal = sum_arr(pay_arr_2020,mon)
    #     jijin_total = sum_arr(jijin_arr_2020,mon)
    #     pre_total = pay_toal - jijin_total - 6500 * mon
    #     index = cau_total(pre_total)
    #     tax = pre_total * index[0] - index[1] - sum_arr(tax_arr_2020,len(tax_arr_2020))
    #     my_input = pay - jijin - tax
    #     tax_arr_2020.append(tax)
    #     print '2020年{}月 税:'.format(mon) + str(tax) + ' 税收收入:' + str(my_input)
    # print '<=======>'

    #1-5月  5811 = 25044*0.12 + 28000*0.02 + 28000*0.08 + 6 
    #6-7月  3000 = 25044*0.12 + 28000*0.02 + 17346*0.08 + 6
    #8-12月 5430 = 27927*0.12 + 27927*0.02 + 19014*0.08 + 6
    all = 0.0
    pay_arr_2019 = [28000,28000,28565,28000,29680,29680,29680,29680,29680,29680,35220,35220]
    jijin_arr_2019 = [5811,5811,5811,5811,5811,4958,4958,5436,5436,5436,5436,5436]
    tax_arr_2019 = []
    for i in range(0,len(pay_arr_2019)):
        if i < 2:
            continue
        mon = i + 1
        pay = pay_arr_2019[i]
        jijin = jijin_arr_2019[i]
        pay_toal = sum_arr(pay_arr_2019,mon)
        jijin_total = sum_arr(jijin_arr_2019,mon)
        pre_total = pay_toal - jijin_total - 6500 * mon
        index = cau_total(pre_total)
        tax = pre_total * index[0] - index[1] - sum_arr(tax_arr_2019,len(tax_arr_2019))

        xiao_shu = round(tax * 0.9999,4)

        my_input = round(pay - jijin - xiao_shu,2)
        tax_arr_2019.append(tax)
        all = all + my_input
        # print '2019年{}月 税:'.format(mon) + str(tax) + ' 税后收入:' + str(my_input) + ' 税前:' + str(pay) 
        print '2019年{}月 收入:'.format(mon) + str(my_input)


    print '<=======>'

    # pay_arr_2020 = [34200,34110]
    # jijin_arr_2020 = [6049,6049]
    # tax_arr_2020 = []
    # for i in range(0,len(pay_arr_2020)):
    #     mon = i + 1
    #     pay = pay_arr_2020[i] # 当月工资
    #     jijin = jijin_arr_2020[i] # 当月公积金和社保
    #     pay_toal = sum_arr(pay_arr_2020,mon) # 年度总税前
    #     jijin_total = sum_arr(jijin_arr_2020,mon) # 公积金社保年度总税前
    #     pre_total = pay_toal - jijin_total - 6500 * mon
    #     index = cau_total(pre_total)
    #     tax = pre_total * index[0] - index[1] - sum_arr(tax_arr_2020,len(tax_arr_2020))
    #     my_input = pay - jijin - tax
    #     tax_arr_2020.append(tax)
    #     all = all + my_input
    #     # print '2020年{}月 税:'.format(mon) + str(tax) + ' 税后收入:' + str(my_input) + ' 税前:' + str(pay)
    #     print '2019年{}月 收入:'.format(mon) + str(my_input)
    #
    # print '工资总收入:' + str(all)
    # year_my =  year_total(358000)
    # all = all + year_my
    # print '最近一年总收入:' + str(all)


    pay_arr_2021 = [39210,39210]
    jijin_arr_2021 = [6097,6097]
    tax_arr_2021 = []
    for i in range(0,len(pay_arr_2021)):
        mon = i + 1
        pay = pay_arr_2021[i] # 当月工资
        jijin = jijin_arr_2021[i] # 当月公积金和社保
        pay_toal = sum_arr(pay_arr_2021,mon) # 年度总税前
        jijin_total = sum_arr(jijin_arr_2021,mon) # 公积金社保年度总税前
        pre_total = pay_toal - jijin_total - 6500 * mon
        index = cau_total(pre_total)
        tax = pre_total * index[0] - index[1] - sum_arr(tax_arr_2021,len(tax_arr_2021))
        my_input = pay - jijin - tax
        tax_arr_2021.append(tax)
        all = all + my_input
        # print '2020年{}月 税:'.format(mon) + str(tax) + ' 税后收入:' + str(my_input) + ' 税前:' + str(pay)
        print '2021年{}月 收入:'.format(mon) + str(my_input)

    print '工资总收入:' + str(all)
    year_my =  year_total(325000)
    all = all + year_my
    print '最近一年总收入:' + str(all)