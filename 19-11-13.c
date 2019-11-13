#include <stdio.h>
#include <string.h>

int check(){
    char s[88], *basePtr = (char *) &s;
    scanf("%s", s);
    int i = strlen(s) - 1;
    for (int p = 0; p < i; p++, i--) {
        if (*(basePtr + p) != *(basePtr + i)) {
            printf("No.\n");
            return 1;
        }
    }
    printf("Yes.\n");
    return 1;
}

int main() {
    while (check());
}
