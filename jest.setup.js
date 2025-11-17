// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import 'whatwg-fetch'

// Mock Firebase
global.fetch = jest.fn()
