"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Mic, ImageIcon } from "lucide-react"

interface MediaViewerProps {
  hasVideo?: boolean
  hasAudio?: boolean
}

export function MediaViewer({ hasVideo, hasAudio }: MediaViewerProps) {
  return (
    <div className="space-y-4">
      {hasVideo && (
        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-card-foreground">Video Frame Analysis</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((frame) => (
              <div
                key={frame}
                className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${frame * 0.05}s` }}
              >
                <div className="text-center space-y-1">
                  <ImageIcon className="h-8 w-8 mx-auto text-primary/50" />
                  <p className="text-xs text-muted-foreground">Frame {frame}</p>
                  <Badge variant="secondary" className="text-xs">
                    0:{frame * 5}s
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {hasAudio && (
        <Card
          className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-card-foreground">Audio Transcript Timeline</h4>
          </div>
          <div className="space-y-3">
            {[
              { time: "0:00", text: "Introduction to the topic..." },
              { time: "0:15", text: "Main claim presented..." },
              { time: "0:32", text: "Supporting evidence mentioned..." },
            ].map((segment, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-3 rounded-lg bg-muted/30 transition-all duration-300 hover:bg-muted/50 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
              >
                <Badge variant="outline" className="shrink-0">
                  {segment.time}
                </Badge>
                <p className="text-sm text-muted-foreground">{segment.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!hasVideo && !hasAudio && (
        <Card className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-card-foreground">Image Analysis</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((img) => (
              <div
                key={img}
                className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${img * 0.05}s` }}
              >
                <div className="text-center space-y-1">
                  <ImageIcon className="h-8 w-8 mx-auto text-primary/50" />
                  <p className="text-xs text-muted-foreground">Image {img}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
