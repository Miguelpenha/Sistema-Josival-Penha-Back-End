module.exports = {
  apps : [{
    name: "Sistema-Josival-Penha",
    script: "./app.js",
    instances: "max",
    exec_mode: "cluster_mode",
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }]
}