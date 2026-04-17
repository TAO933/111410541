function mathTool(num1, num2, action) {
  return action(num1, num2);
}

const addResult = mathTool(10, 5, function(a, b) {return a + b;});

const subtractResult = mathTool(10, 5, (a, b) => a - b);

console.log(addResult);      // 15
console.log(subtractResult); // 5
