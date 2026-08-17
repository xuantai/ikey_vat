module.exports = {
  apps: [
    {
      name: "ikey-vat",
      script: "./dist/server.cjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      autorestart: true,
      max_memory_restart: "350M",
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      time: true,
    },
  ],
};
