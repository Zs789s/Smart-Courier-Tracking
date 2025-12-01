module.exports = {
  apps: [{
    name: 'smart-courier-system',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'data.sqlite'],
    max_memory_restart: '500M'
  }]
};
