function fibonacci(count) {
  let seq = [0, 1];
  while (seq.length < count) {
    let len = seq.length;
    seq.push(seq[len - 1] + seq[len - 2]);
  }
  return seq;
}
console.log(fibonacci(8)); // [0, 1, 1, 2, 3, 5, 8, 13]
