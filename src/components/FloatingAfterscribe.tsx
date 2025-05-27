"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { CornerDownLeft, Terminal, Mic, Copy, Check, ChevronLeft, ChevronRight, Sparkles, Minimize2, Maximize2 } from 'lucide-react'
import { motion } from "framer-motion"
import { useSpeechRecognition } from 'react-speech-recognition'
import { useToast } from './ui/use-toast'
import { logger } from '@/utils/logger'

// This is a mock function. In a real application, you would replace this with an actual API call.
const mockGrammarCheck = async (text: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  // This is a very basic mock correction. A real API would provide much more sophisticated corrections.
  return text.replace(/\bi\b/g, "I").replace(/\s+/g, " ").trim()
}

export default function FloatingAfterscribe() {
  const [inputValue, setInputValue] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isMinimized, setIsMinimized] = useState(false)

  const { toast } = useToast()
  
  // Use the shared speech recognition instance
  const { transcript, listening, resetTranscript } = useSpeechRecognition()

  useEffect(() => {
    // Update input value when transcript changes, but only if active
    if (transcript && isActive) {
      setInputValue(transcript)
    }
    
  }, [transcript, isActive])

  const toggleActive = () => {
    if (!isActive) {
      // Starting new transcription
      resetTranscript()
      setInputValue("")
    }
    setIsActive(!isActive)
  }

  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      setHistory(prevHistory => {
        const newHistory = [inputValue, ...prevHistory.slice(0, 4)]
        return newHistory
      })
      setHistoryIndex(-1)
      logger.debug('Submitted input', { value: inputValue })
      setInputValue("")
      resetTranscript()
      setIsActive(false)
    }
  }, [inputValue, resetTranscript])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCopy = useCallback(() => {
    const textToCopy = inputValue

    const showSuccess = () => {
      setIsCopied(true)
      setShowNotification(true)
      setTimeout(() => {
        setIsCopied(false)
        setShowNotification(false)
      }, 2000)
    }

    const fallbackCopy = () => {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = textToCopy
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (successful) {
          showSuccess()
        } else {
          throw new Error('execCommand failed')
        }
      } catch (err) {
        console.error('Fallback copy failed:', err)
        toast({
          description: 'Copying to clipboard was not permitted.',
          variant: 'destructive'
        })
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showSuccess()
      }).catch((err: Error) => {
        console.error('Failed to copy text via clipboard API:', err)
        fallbackCopy()
      })
    } else {
      fallbackCopy()
    }
  }, [inputValue, toast])

  const navigateHistory = (direction: 'back' | 'forward') => {
    if (direction === 'back' && historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setInputValue(history[newIndex])
    } else if (direction === 'forward' && historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setInputValue(history[newIndex])
    } else if (direction === 'forward' && historyIndex === 0) {
      setHistoryIndex(-1)
      setInputValue('')
    }
  }

  const handleGrammarCheck = async () => {
    setIsChecking(true)
    try {
      const correctedText = await mockGrammarCheck(inputValue)
      setInputValue(correctedText)
    } catch (error) {
      console.error("Error during grammar check:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div className="w-full h-full relative">
      <Card className={`w-[453px] ${isMinimized ? 'h-12' : 'h-[214px]'} bg-blue-100 overflow-hidden pt-1.5 px-4 pb-4 flex flex-col relative transition-all duration-300 ease-in-out shadow-lg mx-auto`}>
        <div className="h-[4px]" />
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-heading font-semibold text-gray-800 flex items-start">
            Afterscribe
            <span className="text-[0.6em] align-top ml-0.5 -mt-1">TM</span>
          </h2>
          <div className="flex-grow flex justify-start ml-16 space-x-2">
            {!isMinimized && (
              <>
                <Button
                  onClick={() => navigateHistory('back')}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-600 hover:bg-gray-200"
                  disabled={historyIndex >= history.length - 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Previous entry</span>
                </Button>
                <Button
                  onClick={toggleActive}
                  disabled={!listening}
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full ${isActive ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">{isActive ? 'Stop transcribing' : 'Start transcribing'}</span>
                </Button>
                <Button
                  onClick={() => navigateHistory('forward')}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-gray-600 hover:bg-gray-200"
                  disabled={historyIndex <= 0}
                >
                  <ChevronRight className="h-5 w-5" />
                  <span className="sr-only">Next entry</span>
                </Button>
              </>
            )}
          </div>
          <div className="flex space-x-2">
            {!isMinimized && (
              <>
                <Button
                  onClick={handleGrammarCheck}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-gray-600 hover:bg-gray-200"
                  disabled={isChecking}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="sr-only">Check grammar</span>
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-gray-600 hover:bg-gray-200"
                >
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy to clipboard</span>
                </Button>
              </>
            )}
            <Button
              onClick={toggleMinimize}
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-gray-600 hover:bg-gray-200"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              <span className="sr-only">{isMinimized ? 'Maximize' : 'Minimize'}</span>
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <>
            <div className="flex-grow flex items-start relative">
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setHistoryIndex(-1)
                }}
                onKeyPress={handleKeyPress}
                className="w-full h-full resize-none bg-transparent border-none focus:outline-none text-gray-800 text-sm pl-6 pt-0.5"
                style={{ minHeight: '5em' }}
                readOnly={isActive}
              />
              <Terminal className="absolute left-0 top-1.5 h-4 w-4 text-gray-500" />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmit}
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-gray-600 hover:text-gray-800 hover:bg-blue-200"
              >
                <CornerDownLeft className="h-4 w-4" />
                <span className="sr-only">Submit</span>
              </Button>
            </div>
          </>
        )}
        {showNotification && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md text-sm">
            Copied to clipboard
          </div>
        )}
      </Card>
    </div>
  )
}