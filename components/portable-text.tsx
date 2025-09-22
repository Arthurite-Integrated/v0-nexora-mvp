import { PortableText, type PortableTextComponents } from "@portabletext/react"
import { urlFor } from "@/lib/sanity"
import Image from "next/image"

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <div className="my-8">
        <Image
          src={urlFor(value).url() || "/placeholder.svg"}
          alt={value.alt || "Blog post image"}
          width={800}
          height={400}
          className="rounded-lg"
        />
        {value.alt && <p className="text-sm text-gray-600 text-center mt-2">{value.alt}</p>}
      </div>
    ),
  },
  block: {
    h1: ({ children }) => <h1 className="text-3xl font-bold font-serif mb-6 mt-8">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold font-serif mb-4 mt-6">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold font-serif mb-3 mt-5">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-bold font-serif mb-2 mt-4">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-teal-600 pl-6 my-6 italic text-gray-700">{children}</blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="text-gray-700">{children}</li>,
    number: ({ children }) => <li className="text-gray-700">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value.href}
        className="text-teal-600 hover:text-teal-700 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
}

interface PortableTextProps {
  value: any
}

export default function CustomPortableText({ value }: PortableTextProps) {
  return <PortableText value={value} components={components} />
}
