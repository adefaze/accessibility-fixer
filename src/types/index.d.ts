export interface AccessibilityIssue {
  id?: string
  nodeId?: string
  title: string
  detail?: string
  severity?: 'critical' | 'warning' | 'info'
}

declare module 'framer-plugin' {
  // Minimal ambient types used in this scaffold. Real plugin should install official types.
  export function showUI(options: any): void
  export function notify(message: string, opts?: any): void
  export function getNodesWithType(type: string): Promise<any[]>
  export function getCanvasRoot(): Promise<any>
  export function getSelection(): Promise<any[]>
  export function getNode(id: string): Promise<any>
  export function setAttributes(id: string, attrs: any): Promise<void>
  export function setPluginData(key: string, value: string): Promise<void>
  export function getPluginData(key: string): Promise<string | null>
  export function navigateTo(nodeId: string, opts?: any): void
  export default any
}
