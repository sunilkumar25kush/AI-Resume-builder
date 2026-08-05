/* Benchmark: llama3.2 vs Qwen3-8B — same realistic resume-generation prompt, 400 output tokens. */
const models = ["llama3.2:latest", "innocentevil0914/Qwen3-8B-UD-Q4_K_XL:latest"];
const prompt = `You are a resume writer. Write a professional resume summary and 3 experience bullets for a React developer applying for a fintech job. Use ATS keywords. Respond in JSON with keys summary and experience.`;

for (const model of models) {
  const t0 = Date.now();
  let res;
  try {
    res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({ model, prompt, stream: false, options: { num_predict: 400 } }),
    });
  } catch (e) {
    console.log(`${model}: FETCH FAILED ${e.message}`);
    continue;
  }
  const data = await res.json();
  const totalMs = Date.now() - t0;
  const loadMs = (data.load_duration ?? 0) / 1e6;
  const evalMs = (data.eval_duration ?? 0) / 1e6;
  const tokps = data.eval_count > 0 && evalMs > 0 ? data.eval_count / (evalMs / 1000) : 0;
  console.log(
    `\n${model}\n  total wall: ${(totalMs / 1000).toFixed(1)}s  (model load: ${(loadMs / 1000).toFixed(1)}s)\n` +
      `  ${data.eval_count} tokens in ${(evalMs / 1000).toFixed(1)}s eval = ${tokps.toFixed(1)} tok/s`,
  );
}
