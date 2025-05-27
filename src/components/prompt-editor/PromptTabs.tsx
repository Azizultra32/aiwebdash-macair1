/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { ReactNode, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

interface TabItem {
  label: string;
  content: ReactNode;
}

interface PromptTabsProps {
  tabs: TabItem[];
  defaultActive?: number;
}

/**
 * Generic tabbed UI component used by prompt-related views.
 * Renders a set of labeled tabs and displays the active tab's content.
 */
const PromptTabs = ({ tabs, defaultActive = 0 }: PromptTabsProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  if (!tabs.length) {
    // Nothing to render if no tabs were provided
    return null;
  }

  // Clamp the active index to a valid range
  const safeIndex = Math.min(Math.max(activeIndex, 0), tabs.length - 1);

  const activeLabel = tabs[safeIndex]?.label

  return (
    <Tabs
      value={activeLabel}
      onValueChange={(val) =>
        setActiveIndex(tabs.findIndex((t) => t.label === val))
      }
      className="w-full"
    >
      <TabsList className="mb-5 flex flex-wrap gap-2 bg-transparent">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.label} value={tab.label}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.label} value={tab.label} className="mt-0">
          <Card>
            <CardContent className="p-4">{tab.content}</CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
};

export default PromptTabs;
