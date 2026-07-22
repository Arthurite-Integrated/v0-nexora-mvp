import NextDynamic from "next/dynamic"

export { metadata, viewport } from "next-sanity/studio"

const Studio = NextDynamic(() => import("./_studio"), { ssr: false })

export default function StudioPage() {
  return <Studio />
}
