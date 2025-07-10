# Mobile & Desktop Testing Agent Demo

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](frontend/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI%20CUA-orange.svg)](https://platform.openai.com/docs/guides/tools-computer-use)

This monorepo demonstrates how to use OpenAI's CUA (Computer Use Assistant) model to automate both **mobile and desktop** frontend testing. It uses [Playwright](https://playwright.dev) to simulate real device interactions and navigate web applications, with the CUA model executing test cases through natural language instructions.

The system supports comprehensive testing across multiple platforms with real device simulation, touch interactions, and responsive design validation.

![Mobile & Desktop Testing](./screenshot.jpg)

> [!CAUTION]  
> Computer use is in preview. Because the model is still in preview and may be susceptible to exploits and inadvertent mistakes, we discourage trusting it in authenticated environments or for high-stakes tasks.

## 🚀 Features

### Multi-Platform Testing
- **Desktop Testing**: Traditional web browser automation
- **Mobile Testing**: iOS and Android device simulation
- **Cross-Platform**: Seamless switching between testing modes

### Mobile Device Support
- **iOS Devices**: iPhone 15 Pro, iPhone 14, iPhone SE
- **Android Devices**: Samsung Galaxy S24/S23, Google Pixel 8
- **Real Device Simulation**: Accurate viewport, user agents, and touch capabilities

### Advanced Interactions
- **Desktop**: Click, type, drag, keyboard shortcuts, mouse actions
- **Mobile**: Tap, swipe, pinch, long press, device rotation
- **Responsive**: Automatic adaptation to device capabilities

### Smart Test Execution
- **Natural Language**: Write test cases in plain English
- **Visual Feedback**: Real-time screenshots and progress tracking
- **Intelligent Actions**: Context-aware interaction selection
- **Error Recovery**: Automatic retry and error handling

## 🏗️ Architecture

The repository contains four interconnected applications:

- **frontend** – Next.js interface for configuring and monitoring tests
- **cua-server** – Node.js service that manages CUA model communication and device automation
- **sample-test-app** – Mobile-optimized e-commerce demo application
- **mobile-device-manager** – Device simulation and interaction management

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key with CUA model access
- Operating System: macOS, Windows, or Linux

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/openai/openai-testing-agent-demo
   cd openai-testing-agent-demo
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install Playwright browsers
   npx playwright install
   npx playwright install-deps
   ```

3. **Set up environment files**
   ```bash
   # CUA Server
   cp cua-server/.env.example cua-server/.env.development
   
   # Frontend
   cp frontend/.env.example frontend/.env.development
   
   # Sample Test App
   cp sample-test-app/.env.example sample-test-app/.env.development
   ```

4. **Configure API keys**
   
   Edit each `.env.development` file and add your OpenAI API key:
   ```bash
   OPENAI_API_KEY=your-openai-api-key-here
   ```

   For the sample app, set demo credentials:
   ```bash
   ADMIN_USERNAME=test_user_name
   ADMIN_PASSWORD=test_password
   ```

## 🚀 Quick Start

1. **Start all services**
   ```bash
   npm run dev
   ```

   This launches:
   - **Frontend UI**: http://localhost:3000
   - **Sample app**: http://localhost:3005
   - **CUA server**: ws://localhost:8000

2. **Open the testing interface**
   
   Navigate to [localhost:3000](http://localhost:3000)

3. **Choose your testing mode**
   - **Desktop Testing**: Traditional browser automation
   - **Mobile Testing**: iOS/Android device simulation

4. **Configure and run tests**
   - Select target device (for mobile)
   - Write test instructions in natural language
   - Set up test variables and credentials
   - Monitor execution in real-time

## 📱 Mobile Testing Guide

### Supported Devices

| Device | Platform | Viewport | Scale Factor |
|--------|----------|----------|--------------|
| iPhone 15 Pro | iOS | 393×852 | 3.0 |
| iPhone 14 | iOS | 390×844 | 3.0 |
| iPhone SE | iOS | 375×667 | 2.0 |
| Samsung Galaxy S24 | Android | 360×780 | 3.0 |
| Samsung Galaxy S23 | Android | 360×780 | 3.0 |
| Google Pixel 8 | Android | 412×915 | 2.625 |

### Mobile Interactions

```typescript
// Available mobile actions
- tap: Single touch interaction
- double_tap: Double tap gesture
- long_press: Touch and hold
- swipe: Directional swipe (up, down, left, right)
- pinch: Zoom in/out gesture
- scroll: Touch-based scrolling
- rotate: Device orientation change
```

### Example Mobile Test Case

```
Test mobile e-commerce checkout:
1. Tap on the hamburger menu
2. Swipe down to browse product categories
3. Tap on "Clothing" category
4. Swipe through product gallery
5. Tap "Add to Cart" on green shirt
6. Pinch to zoom product image
7. Navigate to cart using bottom navigation
8. Fill mobile checkout form
9. Tap "Complete Purchase"
```

## 🖥️ Desktop Testing Guide

### Desktop Interactions

```typescript
// Available desktop actions
- click: Mouse click (left, right, middle)
- double_click: Double click
- type: Keyboard text input
- keypress: Keyboard shortcuts (Ctrl+A, etc.)
- drag: Mouse drag operations
- scroll: Mouse wheel scrolling
- hover: Mouse hover effects
```

### Example Desktop Test Case

```
Test desktop e-commerce workflow:
1. Navigate to product catalog
2. Use filters to narrow selection
3. Click on product to view details
4. Add multiple items to cart
5. Proceed to checkout
6. Fill shipping and payment forms
7. Complete purchase
```

## 🎯 Advanced Configuration

### Environment Variables

**CUA Server** (`cua-server/.env.development`)
```bash
OPENAI_API_KEY=your-openai-key
DISPLAY_WIDTH=1024              # Desktop viewport width
DISPLAY_HEIGHT=768              # Desktop viewport height
MOBILE_TESTING_ENABLED=true     # Enable mobile device support
SOCKET_PORT=8000               # WebSocket server port
CORS_ORIGIN=*                  # CORS configuration
LOG_LEVEL=info                 # Logging level
```

**Frontend** (`frontend/.env.development`)
```bash
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_SOCKET_SERVER_URL=http://localhost:8000
```

**Sample App** (`sample-test-app/.env.development`)
```bash
ADMIN_USERNAME=test_user_name
ADMIN_PASSWORD=test_password
```

### Custom Device Configuration

Add custom mobile devices in `cua-server/src/services/mobile-device-manager.ts`:

```typescript
'Custom Device': {
  name: 'Custom Device',
  userAgent: 'your-custom-user-agent',
  viewport: { width: 414, height: 896 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  platform: 'android' // or 'ios'
}
```

## 📊 Test Results and Monitoring

### Real-time Feedback
- **Live Screenshots**: Visual progress tracking
- **Step-by-step Status**: Individual test step results
- **Execution Timing**: Performance metrics
- **Error Reporting**: Detailed failure analysis

### Test Artifacts
- **Screenshots**: Saved at key interaction points
- **Execution Logs**: Detailed action history
- **Performance Metrics**: Timing and resource usage
- **Error Details**: Stack traces and debugging info

## 🔧 Troubleshooting

### Common Issues

**Browser Installation**
```bash
npx playwright install
npx playwright install-deps
```

**Mobile Device Not Recognized**
- Verify device name spelling matches exactly
- Check `getMobileDevices` response in browser console
- Ensure device is defined in `mobile-device-manager.ts`

**API Key Issues**
- Verify OpenAI API key is valid and has CUA access
- Check environment file locations and syntax
- Restart services after changing environment variables

**Touch Interactions Not Working**
- Ensure mobile device is properly selected
- Verify `hasTouch: true` in device configuration
- Check browser console for touch event errors

**Network Connectivity**
- Verify all services are running on correct ports
- Check firewall settings for local development
- Ensure WebSocket connection is established

### Debug Mode

Enable detailed logging:
```bash
# Set in environment files
LOG_LEVEL=debug
```

Monitor WebSocket connections:
```bash
# Check browser console
console.log(window.socket?.connected)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

Please ensure all tests pass and follow the existing code style.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔐 Security Notes

- **Test Environment Only**: This project is designed for testing environments
- **No Production Data**: Avoid using real user data
- **API Key Security**: Keep your OpenAI API key secure and never commit it to version control
- **Network Security**: Run on trusted networks only

## 🆘 Support

- **Documentation**: Check individual component READMEs
- **Issues**: Report bugs via GitHub Issues
- **OpenAI API**: Visit [OpenAI Platform Documentation](https://platform.openai.com/docs/guides/tools-computer-use)

## 🚀 What's Next

- **iOS Safari Testing**: Native iOS browser support
- **Android Chrome Testing**: Native Android browser support
- **CI/CD Integration**: Automated testing pipelines
- **Performance Testing**: Load and stress testing capabilities
- **Visual Regression**: Automated visual comparison testing
- **API Testing**: Backend service testing integration

---

**Ready to start testing?** 🎉

```bash
npm run dev
# Open http://localhost:3000
# Choose Mobile or Desktop mode
# Start automating your tests!
```
```

This updated README provides:

1. **Comprehensive Overview**: Clear explanation of mobile and desktop capabilities
2. **Detailed Setup**: Step-by-step installation and configuration
3. **Device Support**: Complete list of supported mobile devices
4. **Interaction Guide**: Examples of mobile and desktop interactions
5. **Advanced Configuration**: Environment variables and customization options
6. **Troubleshooting**: Common issues and solutions
7. **Visual Organization**: Tables, code blocks, and clear sections
8. **Security Considerations**: Important security notes
9. **Future Roadmap**: Planned enhancements
10. **Quick Start**: Simple commands to get started immediately

The documentation now matches the enhanced mobile and desktop testing capabilities while maintaining clarity for both beginners and advanced users.
