# AllKit - All-in-One Online Tools Platform

AllKit is a comprehensive platform offering 350+ free online tools across various categories including PDF, Image, Video, Audio, Developer Tools, QR Code, Data Converter, and Security Tools.

## Features

- 🛠️ 350+ Free Online Tools
- 🎨 Modern, Responsive UI
- 🌓 Light & Dark Mode
- 🔒 Secure File Processing
- 🚀 Fast & Reliable
- 📱 Mobile Friendly

## Tech Stack

### Frontend
- Next.js (TypeScript)
- Tailwind CSS
- React

### Backend
- Python (FastAPI) - Heavy tools
- Node.js (Express) - Light tools
- PostgreSQL (Primary DB)
- MongoDB (Analytics)
- Redis (Queue)
- AWS S3 (Storage)

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/allkit.git
   cd allkit
   ```

2. Start the development environment:
   ```bash
   docker-compose up -d
   ```

3. Access the applications:
   - Frontend: http://localhost:3000
   - Python API: http://localhost:8000
   - Node.js API: http://localhost:3001

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Python Backend Development
```bash
cd api-python
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Node.js Backend Development
```bash
cd api-node
npm install
npm run dev
```

## Project Structure

```
allkit/
├── frontend/          # Next.js frontend
├── api-python/        # FastAPI backend
├── api-node/          # Express.js backend
├── storage/           # File storage
└── docker-compose.yml # Docker configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@allkit.com or join our Slack channel. 