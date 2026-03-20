const classData = {
  className: "三年甲班",
  students: [
    { name: "小華", score: 88 },
    { name: "小美", score: 95 },
    { name: "小強", score: 72 },
    { name: "小雯", score: 61 }
  ]
};

function classReport(data) {
  let passed = [];
  let failed = [];

  for (let s of data.students) {
    if (s.score >= 60) {
      passed.push(s.name);
    } else {
      failed.push(s.name);
    }
  }

  console.log(`班級：${data.className}`);
  console.log(`及格：${passed.join("、")}`);
  console.log(`不及格：${failed.length > 0 ? failed.join("、") : "無"}`);
}
classReport(classData);
