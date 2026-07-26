# VoltiHome — Oracle Cloud (OCI) Deployment

Deploy the full stack to a **free Oracle Cloud "Always Free" Ampere A1** VM (ARM64, 4 OCPU / 24 GB RAM), reachable over plain HTTP at the instance's public IP. Everything runs from the single `docker-compose.yml`.

> **Architecture note:** Ampere A1 is ARM64. Every image builds/runs natively on ARM **except Apache Ignite** (amd64-only). The compose file pins `platform: linux/amd64` on the `ignite` service so it runs under emulation — step 4 installs the emulator. If Ignite emulation is too slow/flaky for you, use a small **x86 (E-series) paid** VM instead and remove that `platform:` line.

---

## 1. Create the VM (OCI Console)

1. Sign in to **cloud.oracle.com** → *Compute → Instances → Create Instance*.
2. **Image & shape:** Image *Ubuntu 22.04*; Shape → *Ampere* → **VM.Standard.A1.Flex**, set **4 OCPU / 24 GB** (all inside Always Free).
3. **Networking:** create/assign a VCN with a public subnet; ensure **"Assign a public IPv4 address"** is on.
4. **SSH keys:** upload your public key (or let OCI generate one and download the private key).
5. Create. Note the **Public IP**.

## 2. Open the ports

**a) OCI Security List** (Networking → your VCN → the public subnet → its Security List → *Add Ingress Rules*), source `0.0.0.0/0`, TCP:
- `8081` (the web app) — required
- `8080` (Swagger / API) — optional
- `80` (only if you remap the web app to port 80, see step 6)

**b) The instance's own firewall** (Ubuntu OCI images ship with restrictive iptables). SSH in, then:
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8081 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

## 3. Install Docker

```bash
sudo apt-get update
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker   # or log out/in
```

## 4. Enable amd64 emulation (for Ignite on ARM)

```bash
docker run --privileged --rm tonistiigi/binfmt --install amd64
```

## 5. Get the code and configure

```bash
git clone https://github.com/nuhregaibunsal/i2i-Academy-VoltiHome-18.git
cd i2i-Academy-VoltiHome-18
cp .env.example .env
nano .env
```
In `.env` set at minimum:
- `POSTGRES_PASSWORD` — a strong password (not the default).
- `GEMINI_API_KEY` — a **valid** Google Gemini key (otherwise AI falls back to a static Turkish tip).
- `SEED_DEMO_DATA=true` — seeds 3 demo homes + the `testuser@example.com / 123456` resident login.

## 6. (Optional) serve the web app on port 80

Edit `docker-compose.yml`, `webapp` service, change `"8081:80"` → `"80:80"`. Then the app is at `http://<public-ip>` with no port. (Open port 80 in the Security List too.)

## 7. Launch

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f core   # watch for "Started" + "Seeded 3 demo homes"
```
First build takes a few minutes (pulls images, builds core/sensors/webapp, emulated Ignite starts a bit slower).

## 8. Use it

- App: `http://<public-ip>:8081` (or `http://<public-ip>` if you did step 6)
- Swagger: `http://<public-ip>:8080/swagger-ui.html`
- Resident demo login is pre-filled: `testuser@example.com` / `123456`

The web app's nginx proxies `/api` to the core **inside** the Docker network, so the browser only needs the web app port — no extra API URL config.

## Operations

```bash
docker compose logs -f <service>     # core | sensors | webapp | kafka | ignite | postgres
docker compose restart core          # restart one service
docker compose down                  # stop (keeps data volume)
docker compose down -v && docker compose up -d --build   # full clean reset (wipes data → reseeds)
git pull && docker compose up -d --build                 # deploy an update
```

## Troubleshooting

- **Can't reach the app:** check *both* the OCI Security List ingress rule *and* the instance `iptables` (step 2). Confirm the container is up: `docker compose ps`.
- **Ignite keeps restarting:** emulation issue — check `docker compose logs ignite`; if unstable, switch to a small x86 VM and drop the `platform: linux/amd64` line.
- **AI advice is a generic Turkish sentence:** `GEMINI_API_KEY` is missing/invalid — that's the built-in fallback, by design.
- **Low memory during build:** the A1 has 24 GB; if you chose a smaller shape, add swap: `sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`.
