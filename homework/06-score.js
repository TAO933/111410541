const student = {
  name: "小明",
  scores: [88, 92, 75, 96, 84]
};

function calcAverage(student) {
  let total = 0;
  for (let score of student.scores) {
    total += score;
  }
  return `${student.name} 的平均分：${(total / student.scores.length).toFixed(1)}`;
}
console.log(calcAverage(student)); // 小明 的平均分：87.0
