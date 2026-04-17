const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 }
];

const firstAdult = users.find(user => user.age >= 18);
console.log(firstAdult); // 輸出: { name: "Alice", age: 25 } 
