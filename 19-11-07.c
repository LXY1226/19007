#include <stdio.h>
#include <string.h>

#define nums 14 //此处更改行数
#define num 2 * nums + 1

void printState(int state[num]) {
    for (int j = 0; j < num; ++j) {             //开始遍历数组中的值
        if (state[j] == 0)                      //如果值为0
            printf("    ");                    //则输出补位的三个空格
        else                                    //否则
            printf("%4d", state[j]);            //输出带有前面补位空格的数字
    }
    printf("\n");                                //换行
}

void yanghuiA() {
    int lastState[num] = {0};                                   //初始化初始数组
    int newState[num];                                          //初始化修改后数组
    lastState[nums] = 1;                                        //令初始数组的中间值为1
    printState(lastState);                                      //打印第一行的数据
    for (int i = 0; i < nums; ++i) {                            //开始循环
        newState[0] = lastState[1];                             //令新数组中左右两边的值为上一数组左右两边靠内一位的值
        newState[num - 1] = lastState[num - 2];                 //同上
        for (int j = 1; j < num - 1; ++j) {                     //开始中间数循环
            newState[j] = lastState[j - 1] + lastState[j + 1];  //新一行数组数字等于前一行数组对应位置前后两项和
        }
        printState(newState);                                   //打印新数组
        memcpy(&lastState, &newState, sizeof(lastState));       //#新函数# 将新数组复制到旧数组，作为下一次循环的上一行
    }
}

void yanghui() {
    int a[nums][nums] = {0};
    a[0][0] = 1;
    for (int i = 0; i < nums; ++i) {
        for (int j = 0; j < i; ++j)
            a[i][j] = a[i - 1][j - 1] + a[i - 1][j];
    }
    for (int i = 0; i < nums; ++i) {
        for (int j = 0; j < i; ++j)
            printf("%3d ", a[i][j]);
        printf("\n");
    }
}
//斐波那契递归实现 
void fibonacciA() {
    int a = 1, b = 1, c;
    printf("%3d %3d ", a, b);
    for (int i = 2; i < nums; ++i) {
        c = a + b;
        printf("%3d ", c);
        a = b;
        b = c;
    }
}

//斐波那契数组实现 
void fibonacci() {
    int a[nums];
    a[0]=a[1]=1;
    for (int i = 2; i < nums; ++i) {
        a[i] = a[i - 2] + a[i - 1];
    }
    for (int i = 0; i < nums; ++i) {
        printf("%3d ", a[i]);
    }
}

int main() {
    fibonacci();
}

