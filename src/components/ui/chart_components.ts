// src/components/ui/chart.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-[350px]", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  className?: string
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ className, active, payload, label, ...props }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    >
      {label && (
        <div className="font-medium text-foreground mb-1">{label}</div>
      )}
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartTooltip = ({ content, ...props }: any) => {
  return <div {...props}>{content}</div>
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }

// src/components/ui/toaster.tsx
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// src/components/TestPage.tsx - Missing component referenced in App.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🧪 Test Page</h1>
        <p className="text-muted-foreground">Test various components and features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Environment</CardTitle>
          <CardDescription>This page is for testing new features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use this page to test new components, features, or debug issues.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// src/components/PublicWebChat.tsx - Another missing component
import { WebChat } from "@/components/dashboard/WebChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PublicWebChat() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>💬 Chat with Aurion</CardTitle>
            <CardDescription>
              Get instant help and support from our AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WebChat 
              characterProfile={{
                id: '1',
                name: 'Aurion',
                description: 'AI Assistant ready to help you'
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}