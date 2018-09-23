---
layout:     post
category:   基础
title:      "算法题目"
subtitle:   "一些算法题的解法"
date:       2015-03-16 12:00:00
author:     "Ted"
header-img: "img/Http/bg.jpg"
---

1、实现单例模式

2、数组中的重复数字

3、蛇形矩阵/顺时针矩阵

4、二维数组中的查找

5、替换字符串

6、链表的一些操作

7、反向打印链表

8、树的一些操作

9、重建树

10、用两个栈来实现队列



#### 1、实现单例模式

OC中的单例模式

```objc
+ (SingleObject *)sharedSingleton{
    static SingleObject *_singleObj = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _singleObj = [[self alloc] init];
    });
    return _singleObj;
}
```

#### 2、数组中的重复数字

> 在长度为n的数组中，所有的元素都是0到n-1的范围内。 数组中的某些数字是重复的，但不知道有几个重复的数字，也不知道重复了几次，请找出任意重复的数字。 例如，输入长度为7的数组{2,3,1,0,2,5,3}，那么对应的输出为2或者3。

解(一)：

```c
/* 
	快排之后，值与位置不对应的就是重复的
*/
int method_2(int data[],int length){
	quick_sort(data,0,6);
	for (int i = 0; i < length; ++i)
	{
		if (data[i] != i)
		{
			return data[i];
		}
	}
    return 0;
}


/* 
	快排算法
*/
void quick_sort(int data[],int l, int r){
    int i = l;
    int j = r;
    int temp = data[i]; //l位置也就是i位置挖空,数值作为分化的标记。i位置现在为空
    while(i< j){ //从i,j两边向中间靠拢，将小于的值放到左边，大于的值放到右边
        while(i<j && data[j] > temp){ //从右到左找到第一个小于temp的数
            j--;
        }
        if (i<j)
        {
            data[i] = data[j]; //将j位置小于temp的值，填入上一个挖空的i位置，j位置现在为空。
            i++;
        }

        while(i<j && data[i] < temp){ //从左往右找到第一个大于x的数 
            i ++;
        }
        if (i<j)
        {
            data[j] = data[i];
            j--;
        }
    }
    data[i] = temp;
    quick(data,l,i-1);
    quick(data,i+1,r);
}
```

解(二):

```c
/* 
	利用一个Hash表，已有的值在表中标记，重复的值就可以得到了
*/
int method_1(int data[],int length){
	int hashMap[length];
    for (int i = 0; i < length; ++i)
    {
    	hashMap[length] = 0;
    }

    for (int i = 0; i < length; ++i)
    {
    	int value = data[i];
    	if (hashMap[value] == 0){
    		hashMap[value] += 1;
    	}else{
    		return value;
    	}
    }
    return 0;
}
```

解(三):

```c
/* 
以数组{2,3,1,0,2,5,3}为例来分析找到重复数字的步骤。数组的第 0 个数字（从 0 开始计数，和数组的下标保持一致）是 2，与它的下标不相等，于是把它和下标为 2 的数字 1 交换。交换之后的数组是{1.3.2.0.2.5.3}。此时第 0 个数字是 1，仍然与它的下标不相等，继续把它和下标为 1 的数字 3 交换，得到数组{3,1,2,0,2,5,3}.接下来继续交换第 0 个数字 3 和第 3 个数字 0，得到数组{0,1,2,3,2,5,3}。此时第 0 个数字的数值为 0，接着扫描下一个数字。在接下来的几个数字中，下标为 1，2，3 的三个数字分别为 1，2，3 它们的下标和数值都分别相等，因此不需要做任何操作。接下来扫描到下标为 4 的数字 2。由于它的数值与它的下标不相等，再比较它和下标为 2 的数字。注意到此时数组中下标为 2 的数字也是 2，也就是数字在下标为 2 和下标为 4 的两个位置都出现了，因此找到一个重复的数字。
*/
int method_3(int data[],int length){
    for (int i = 0; i < length; ++i)
    {
        while(data[i] != i){
            if (data[i] == data[data[i]])
            {
                return data[i];
            }else{
                int temp = data[i];
                data[i] = data[temp];
                data[temp] = temp;
            }
        }
    }
    return 0;
}
```

#### 3、蛇形矩阵/顺时针矩阵

![img](/img/Simple_1/25.png)

```c
void temp(int n,int m){
   	// 数组初始化
    int a[n][m];
        for(int i=0;i<n;i++)
    {
        for(int j=0;j<m;j++){
            a[i][j] = 0;
        }
    }

  	// 从右上角开始
    int x,y,temp;
    x = 0;
    y = m-1;
    temp = a[x][y] = 1;

    while(temp < n * m ){
        // 向下走，一直到m或者下一行已经赋值
        while (x+1<m && !a[x+1][y]){
            a[++x][y]=++temp;
        }

        // 向左走，一直到0列或者前列已经赋值
        while (y-1>= 0 && !a[x][y-1]){
            a[x][--y]=++temp;
        }

        // 向上走，一直走到0行或者上行已经赋值
        while (x-1>=0 && !a[x-1][y]){
            a[--x][y]=++temp;
        }

        // 向右方向，一直走到最右或者右列已经赋值
        while (y+1< m && !a[x][y+1]){
            a[x][++y]=++temp;
        }
    }

    // 打印
    for(int i=0;i<n;i++)
    {
        for(int j=0;j<m;j++)
            printf("%4d ",a[i][j]);
        printf("\n\n");
    }
}
```

#### 4、二维数组中的查找

> 在一个二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

![img](/img/Simple_1/26.png)

思路：首先选取数组中右上角的数字。如果该数字等于要查找的数字，查找过程结束；如果该数字大于要查找的数字，剔除这个数字所在的列；如果该数字小于要查找的数字，剔除这个数字所在的行。也就是说如果要查找的数字不在数组的右上角，则每一次都在数组的查找范围中剔除一行或者一列，这样每一步都可以缩小查找的范围，直到找到要查找的数字，或者查找范围为空。

　　例如，我们要在上述的二维数组中查找数字7的步骤如下图所示：

![img](/img/Simple_1/27.jpg)

```c
int find(int row,int col,int arr[row][col],int num){
    int i = 0;
    int j = col -1;
    while (j+1){
        int t = arr[i][j];
        if (t == num)
        {
            return 1;
        }else if (t > num){  //选择下一列
            j--; 
        }else{ // 在这一行往下找
            i++;
        }
    }
    return 0;
}
```

#### 5、替换字符串

题目：请实现一个函数，把字符串中的每个空格替换成"%20"，例如“We are happy.”，则输出“We%20are%20happy.”

```c
/*  请实现一个函数，把字符串中的每个空格替换成"%20"，例如“We are happy.”，则输出“We%20are%20happy” */

#include <stdio.h>
#include<string.h>

void replace(char *ori,char *des){
    int len = strlen(ori);
    int temp = 0;
    for (int i = 0; i < len; ++i)
    {
        if (ori[i] == ' ')
        {
            temp ++;
        }
    }
    printf("%d\n",len);
    char tar[len+temp*2+1];
    temp = 0;
    for (int i = 0; i < len; ++i)
    {
        if (ori[i] == ' '){
            tar[temp] = '%';
            tar[temp+1] = '2';
            tar[temp+2] = '0';
            temp += 3;
        }else{
            tar[temp] = ori[i];
            temp ++;
        }
    }
    tar[temp] = '\0';
    stpcpy(des,tar);
}


int main() {
    char *des;
    replace("We are happy.",des);
    printf("%s\n", des);
    return 0;

```

#### 6、链表的一些操作

```c++
#include <iostream>
using namespace std;

//链表节点定义
struct ListNode
{
    int        value;
    ListNode*  next;
};


//创建链表节点
ListNode* CreateListNode(int value)
{
    ListNode* pNode = new ListNode();
    pNode->value = value;
    pNode->next = NULL;

    return pNode;
}

// 链接链表节点
void ConnectListNodes(ListNode* pCurrent, ListNode* next)
{
    if (pCurrent == NULL)
    {
        cout << "Error to connect two nodes." << endl;
        exit(1);
    }

    pCurrent->next = next;
}

//打印链表
void PrintList(ListNode* pHead)
{
    cout << "PrintList start:" << endl;
    ListNode* pNode = pHead;
    while (pNode!=NULL)
    {
        cout << pNode->value << "   ";
        pNode = pNode->next;
    }

    cout << endl << "PrintList end." << endl;
}
```

#### 7、反向打印链表

题目：输入一个链表的头结点，从尾到头反过来打印出每个结点的值。

> 解法一

利用栈先进后出的特点

```c++
#include <stack>

void reverse_List(ListNode *head){
    std::stack<ListNode*> nodeStack;
    ListNode *pnode = head;
    while(pnode != NULL){
        nodeStack.push(pnode);
        pnode = pnode->next;
    }


    while (!nodeStack.empty()){
        ListNode *top = nodeStack.top();
        cout << top->value << endl;
        nodeStack.pop();
    }

}
```

> 解法二

利用递归：代码简洁，但是当链表非常长的时候，就会导致函数递归很深，从而有可能导致函数调用栈溢出。

```c++
void reverse_List(ListNode *pHead){
    if (pHead != NULL)
    {
        if (pHead->next != NULL)
        {
            reverse_List(pHead->next);
        }
        cout << pHead->value << endl;
    }
}
```

#### 8、树的一些操作

```c++
#include <iostream>
using namespace std;


//树结点结构体
struct BinaryTreeNode
{
    int                    nValue;
    BinaryTreeNode*        pLeft;
    BinaryTreeNode*        pRight;
};


//打印树结点
void PrintTreeNode(BinaryTreeNode *pNode)
{
    if (pNode != NULL) {
        
        // 先序遍历
        printf("value of this node is : %d\n", pNode->nValue);

        if (pNode->pLeft != NULL)
            printf("value of its left child is: %d.\n", pNode->pLeft->nValue);
        else
            printf("left child is null.\n");

        // 中序遍历
        // printf("value of this node is : %d\n", pNode->nValue);

        if (pNode->pRight != NULL)
            printf("value of its right childe is : %d.\n", pNode->pRight->nValue);
        else
            printf("right child is null.\n");

        // 后序遍历
        // printf("value of this node is : %d\n", pNode->nValue);
        
    }else{
        printf("this node is null.\n");
    }
    printf("\n");
}

// 打印树
void PrintTree(BinaryTreeNode *pRoot)
{
    PrintTreeNode(pRoot);
    if (pRoot != NULL)
    {
        if (pRoot->pLeft != NULL)
            PrintTree(pRoot->pLeft);
        if (pRoot->pRight != NULL)
            PrintTree(pRoot->pRight);
    }
}
```

#### 9、重建树

题目：输入某二叉树的前序遍历和中序遍历的结果，请重建出该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。例如输入前序遍历序列{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}，则重建二叉树并返回。

```c++
// startPreorder 前序遍历的第一个节点  
// endPreorder   前序遍历的最后后一个节点  
// startInorder  中序遍历的第一个节点  
// startInorder  中序遍历的最后一个节点  

BinaryTreeNode* ConstructCore(int* startPreorder, int* endPreorder, int* startInorder, int* endInorder)
{
    // 先生成根结点
    int rootValue = startPreorder[0];
    BinaryTreeNode *root = new BinaryTreeNode();
    root->nValue = rootValue;
    root->pLeft = root->pRight = NULL;

    // 只有一个结点
    if (startPreorder == endPreorder)
    {
        if (startInorder == endInorder && *startPreorder == *startInorder)
            return root;
        else
            throw std::exception();
    }

    // 在中序遍历中找到根结点的值  
    int *rootInorder = startInorder;
    while (rootInorder <= endInorder && *rootInorder != rootValue)
        ++rootInorder;
    if (rootInorder == endInorder && *rootInorder != rootValue)
        throw std::exception();


    int leftLength = rootInorder - startInorder;    //中序序列的左子树序列长度
    int *leftPreorderEnd = startPreorder + leftLength;    //左子树前序序列的最后一个结点
    if (leftLength > 0) { // 构建左子树
        root->pLeft = ConstructCore(startPreorder + 1, leftPreorderEnd, startInorder, rootInorder - 1);
    }
    if (leftLength < endPreorder - startPreorder){ //构建右子树
        root->pRight = ConstructCore(leftPreorderEnd + 1, endPreorder, rootInorder + 1, endInorder);
    }
    return root;
}

BinaryTreeNode *Construct(int *preorder, int *inorder, int length)//输入前序序列，中序序列和序列长度
{
    if (preorder == NULL || inorder == NULL || length <= 0)
        return NULL;
    return ConstructCore(preorder, preorder + length - 1, inorder, inorder + length - 1);
}


// 普通二叉树  
//              1  
//           /     \  
//          2       3    
//         /       / \  
//        4       5   6  
//         \         /  
//          7       8

int main()
{
    const int length = 8;
    int preorder[length] = { 1, 2, 4, 7, 3, 5, 6, 8 };
    int inorder[length] = { 4, 7, 2, 1, 5, 3, 8, 6 };

    BinaryTreeNode *root = Construct(preorder, inorder, length);
    PrintTree(root);
    return 0;
}
```

#### 10、用两个栈来实现队列

题目：只能使用栈的pop(),top()和push()，以及测试栈是否为空empty()四个操作. 来实现队列的empty(), push(),pop(),back(),front()等操作。

![img](/img/Simple_1/28.jpeg)

思路：所有值放到栈一中，栈二作为临时过渡。

栈一的push()对应队列的push(),top()对应队列的back(),empty()对应empty()

将栈一的值放入到栈二中，正好可以将顺序对调，所以此时栈二的pop()对应队列的pop()，栈二的top()对应队列的front()

```c++
#include <iostream>
#include <stack>

using namespace std;

template <class T>
class MyQueue
{
private:
    stack<int> head;
    stack<int> tail;

public:
    bool empty()const
    {
        return head.empty()&&tail.empty();
    }

    void push(T t)
    {
        head.push(t);
    }

    //删除对头元素
    //因为queue是一种先进先出，而stack是先进后出，所以需要把head里的数据拷贝到tail中然后再从tail中pop头元素
    void pop()
    {
        if(this->empty())
        {
            //throw exception("队列为NULL");
        }
        while(!head.empty())
        {
            tail.push(head.top());
            head.pop();
        }
        //删除头元素
        tail.pop();

        //再将队尾栈容器元素拷贝到队头栈容器中
        while(!tail.empty())
        {
            head.push(tail.top());
            tail.pop();
        }
    }

    T& back()
    {
        if(this->empty())
        {
            // throw exception("head is NULL");
        }
        return head.top();
    }

    //返回第一个元素
    T& front()
    {
        if(this->empty())
        {
            //throw exception("队列为NULL");
        }
        while(!head.empty())
        {
            tail.push(head.top());
            head.pop();
        }

        int tmp =  tail.top();

        //再将队尾栈容器元素拷贝到队头栈容器中
        while(!tail.empty())
        {
            head.push(tail.top());
            tail.pop();
        }

        return tmp;
    }
};

int main()
{
    MyQueue<int> q;
    for(int i=1;i<5;i++)
    {
        q.push(i);
    }

    cout<<"front:"<<q.front()<<endl;
    cout<<"back:"<<q.back()<<endl;

    return 0;
}
```

