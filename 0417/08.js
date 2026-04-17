let listA = [1, 2];
let listB = [3, 4];

function process(a, b) {
  a.push(99);
  b = [100];
}
process(listA, listB);
//listA：[1, 2, 99]
//listB：[3, 4]
