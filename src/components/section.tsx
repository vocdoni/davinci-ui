"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShieldCheck,
  Eye,
  Scale,
  Zap,
  UserX,
  Lock,
  UserCheck,
  Link,
  Activity,
  Shield,
  Puzzle,
  LineChart,
  Wallet,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Grainify } from "@/components/grainify";
import { Gradient } from "@/components/gradient";
import { SocialProofLogo } from "@/components/social-proof-logo";
import { Badge } from "@/components/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Carousel,
  CarouselPrevious,
  CarouselContent,
  CarouselNext,
} from "@/components/ui/carousel";
import { TestimonialItem } from "@/components/testimonial-item";
import { Accordion } from "@/components/ui/accordion";
import { FaqItem } from "@/components/faq-item";

export function Section() {
  return (
    <main className="container space-y-4 px-4 pb-6">
      <section
        style={{ backgroundImage: "url('https://i.ibb.co/H6gjXCg/Landing-Bg.jpg')" }}
        className="w-full flex flex-col rounded-3xl text-accent-foreground relative isolate overflow-hidden md:p-12 p-6 gap-8 bg-cover bg-center"
      >
        <main />
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-white font-heading text-center space-y-4">
            DAVINCI
            <h1 className="font-bold text-white font-heading text-center text-4xl md:text-5xl">
              The universal voting protocol
            </h1>
          </h1>
        </div>
        <div className="relative max-w-3xl mx-auto space-y-8 text-center block">
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            The first voting protocol that truly meets the criteria for universal adoption.
            Leveraging zkSNARKs and Homomorphic Encryption to guarantee privacy, security,
            anticoercion and accessibility for all.
          </p>
          <div className="flex justify-center space-x-10">
            <Button className="rounded-full bg-white text-black hover:bg-white/90 text-lg px-8 py-6 flex items-center justify-center gap-2">
              Join the waiting list
            </Button>
          </div>
        </div>
        <motion.div
          animate={{ x: 0 }}
          initial={{ x: 150 }}
          transition={{ ease: "easeOut", type: "spring", duration: 2 }}
          whileHover={{}}
          className="absolute -z-[1] align-middle"
        >
          <Image
            alt="Image"
            src="/images/ballotbox-removebg-preview.png"
            fill={false}
            width={500}
            height={500}
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            placeholder="empty"
            className="opacity-60 block"
          />
        </motion.div>
      </section>
      <section className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6">
        <Grainify />
        <Gradient className="absolute right-0" />
        <h2 className="text-center text-lg font-semibold leading-8">
          Backed by individuals from leading projects
        </h2>
        <div className="grid w-full grid-cols-4 gap-10 sm:grid-cols-6 sm:gap-12 lg:grid-cols-5">
          <SocialProofLogo image="/images/ethereum-foundation-logo-B01D3C8BAD-seeklogo-com.png" />
          <SocialProofLogo image="/images/Polygonblockchainlogo.png" />
          <SocialProofLogo image="/images/Privado-ID---Primary-Color.png" />
          <SocialProofLogo image="/images/logoopenzeppelin.webp" className="sm:col-start-2" />
          <SocialProofLogo
            image="/images/givethlogo.png"
            className="col-start-2 sm:col-start-auto"
          />
        </div>
      </section>
      <section
        id="solutions"
        className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6"
      >
        <Grainify />
        <Gradient className="absolute top-0 -translate-y-1/2" />
        <Badge text="Decentralized Autonomous Voting Infrastructure for Non-Coercive Inclusion" />
        <div className="flex flex-col sm:flex-row justify-between gap-x-16 gap-y-4">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl grow">
            Why a new voting protocol
          </h2>
          <text className="max-w-md sm:text-right text-balance">
            A decentralized, anonymous, verifiable and anticoercion voting protocol built for mass
            adoption
          </text>
        </div>
        <Card className="overflow-hidden border-none shadow-md">
          <Tabs defaultValue="item-1">
            <TabsContent value="item-1" className="mt-0">
              <div className="grid bg-background mt-0 text-[#0A0A0A] gap-[24px] px-8 pt-8 pb-[18px]">
                <h3 className="text-3xl">The Problem</h3>
                <text>
                  Current voting systems are expensive, inaccessible, and vulnerable, creating
                  barriers to secure digital participation. Only governments and large organizations
                  can afford the technology needed to ensure election security, leaving billions
                  without a viable digital citizen participation option and preventing recurrent
                  voting. This outdated model weakens democracies, highlighting the need for an
                  alternative with a more advanced technological design.
                </text>
              </div>
              <div className="p-8 grid bg-background mt-0 text-[#0A0A0A] gap-[24px]">
                <h3 className="text-3xl">The Solution</h3>
                <text>
                  DAVINCI (Decentralized Autonomous Voting Infrastructure for Non-Coercive
                  Inclusion) is a voting protocol designed for mass adoption, privacy, and security.
                  It enables high-frequency, low-cost elections while ensuring transparency,
                  censorship resistance, anticoercion and integrity.
                </text>
                <div>
                  <h3 className="font-heading text-balance sm:text-xl font-semibold">How works</h3>
                  <text>
                    DAVINCI leverages zkSNARKs and threshold homomorphic encryption (ElGamal) to
                    provide end-to-end verifiability and anonymity allowing voters to participate
                    without compromising privacy. Built as a Layer 2 solution on Ethereum, DAVINCI
                    ensures that votes remain tamper-proof and trustless, eliminating the need for
                    central authorities. A distributed key generation (DKG) system, coordinated
                    through smart contracts, secures encryption key creation while preventing
                    manipulation.Built as a Layer 2 solution on Ethereum, DAVINCI ensures that votes
                    remain tamper-proof and trustless, eliminating the need for central authorities.
                    A distributed key generation (DKG) system, coordinated through smart contracts,
                    secures encryption key creation while preventing manipulation.
                  </text>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-2" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Shape the User Journey</h3>
                  <p className="text-muted-foreground">
                    Leverage built-in best practices to tailor your copy for each stage of the
                    funnel—awareness, consideration, or decision.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/ux-indonesia-w00FkE6e8zE-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-3" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Flexible Integrations</h3>
                  <p className="text-muted-foreground">
                    Seamlessly integrate with popular marketing tools, from CMS platforms to email
                    automation software. Manage everything in one place.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/markus-spiske-Skf7HxARcoc-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-4" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Data-Driven Impact</h3>
                  <p className="text-muted-foreground">
                    Monitor conversions, track engagement, and fine-tune your strategy. Data
                    dashboards make measuring impact a breeze.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/nasa-Q1p7bh3SHj8-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </section>
      <section
        id="solutions"
        className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6"
      >
        <Grainify>
          <div className="w-full px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">Anti-coercion</h3>
                </div>
                <p className="text-muted-foreground">
                  Protects voters from external pressure and manipulation, ensuring votes are cast
                  freely without intimidation or influence.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">Transparent</h3>
                </div>
                <p className="text-muted-foreground">
                  Provides clear audit trails and verification mechanisms while maintaining vote
                  secrecy and integrity of the electoral process.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">Scalable</h3>
                </div>
                <p className="text-muted-foreground">
                  Handles increasing voter populations efficiently, maintaining performance and
                  reliability regardless of election size.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">Efficient</h3>
                </div>
                <p className="text-muted-foreground">
                  Processes votes quickly and accurately, minimizing resource consumption while
                  maintaining security and reliability.
                </p>
              </div>
              <div className="bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <UserX className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">Anonymous</h3>
                </div>
                <p className="text-muted-foreground">
                  Ensures complete voter privacy, making it impossible to link individual votes to
                  specific voters while maintaining vote validity.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Privacy Protection</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ensures voter anonymity through advanced encryption, preventing any link
                      between votes and voter identities.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Verifiability</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Allows voters to verify their vote was correctly recorded and counted without
                      compromising ballot secrecy.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Robust voter authentication system prevents unauthorized access while
                      maintaining accessibility.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Link className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Immutability</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Blockchain technology ensures votes cannot be altered or deleted once recorded
                      in the system.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Transparency</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Open-source protocol allows for public audit while maintaining individual vote
                      privacy.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold">Tamper Resistance</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Multiple security layers protect against manipulation attempts and
                      unauthorized system access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Grainify>
        <Gradient className="absolute top-0 -translate-y-1/2" />
        <Badge text="Why DAVINCI is the future of voting" />
        <div className="flex flex-col sm:flex-row justify-between gap-x-16 gap-y-4">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl grow">
            Attributes&lt;br&gt;
          </h2>
          <text className="max-w-md sm:text-right text-balance">
            DAVINCI eliminates the biggest flaws in voting, ensuring privacy, transparency, and
            security without relying on a central authority.
          </text>
        </div>
        <Card className="overflow-hidden border-none shadow-md">
          <Tabs defaultValue="item-1">
            <TabsContent value="item-2" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Shape the User Journey</h3>
                  <p className="text-muted-foreground">
                    Leverage built-in best practices to tailor your copy for each stage of the
                    funnel—awareness, consideration, or decision.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/ux-indonesia-w00FkE6e8zE-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-3" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Flexible Integrations</h3>
                  <p className="text-muted-foreground">
                    Seamlessly integrate with popular marketing tools, from CMS platforms to email
                    automation software. Manage everything in one place.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/markus-spiske-Skf7HxARcoc-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-4" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Data-Driven Impact</h3>
                  <p className="text-muted-foreground">
                    Monitor conversions, track engagement, and fine-tune your strategy. Data
                    dashboards make measuring impact a breeze.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/nasa-Q1p7bh3SHj8-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Verifiable
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Trust through Transparency. Every vote is mathematically verifiable, from cast to
                tally.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Anonymous
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Protects voter privacy with advanced cryptography.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card">
            <CardHeader className="bg-card bg-background shadow-md rounded-2xl">
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5" />
                Flexible
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Meets any governance requirement and adapts to any identity system.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Scalable
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Built to scale. From community votes to national elections.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Affordable
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                A shared infrastructure for a cost-efficient voting with minimal setup. Accessible
                for all.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Anticoercion
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ensuring free and fair voting, safeguarding against collusion and external
                pressures.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card bg-background shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Neutral
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Decentralized, permissionless protocol ensuring neutrality.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card bg-background shadow-md rounded-2xl flex">
            <CardHeader className="bg-card rounded-2xl bg-background shadow-md block">
              <CardTitle className="flex items-center gap-2">
                <Ethereum className="h-5 w-5" />
              </CardTitle>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Secured by Ethereum&lt;br&gt;
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ensures data integrity and resistance to censorship.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      <section
        id="solutions"
        className="w-full rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 grid gap-x-[32px] p-6"
      >
        <Grainify className="gap-0 block pb-0" />
        <Gradient className="absolute top-0 -translate-y-1/2" />
        <Badge text="COMPARISON" />
        <div className="flex flex-col sm:flex-row justify-between gap-x-16 gap-y-4">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl grow">
            First universal voting protocol
          </h2>
          <text className="max-w-md sm:text-right text-balance text-right">
            DAVINCI is the only protocol that outperforms paper, centralized digital, and on-chain
            voting, meeting all the criteria for a universal voting solution
          </text>
        </div>
        <Image
          alt="Image"
          src="/images/OIption-3(1).svg"
          width={1200}
          height={500}
          className="block pb-0 mb-0"
        />
        <Table>
          <TableCaption>
            Comparison based on average attributes of most common voting systems
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] bg-gray-300">Attributes</TableHead>
              <TableHead className="text-center bg-gray-200 bg-gray-300">
                Traditional paper voting
              </TableHead>
              <TableHead className="text-center bg-gray-200 bg-gray-300">
                Centralized digtal voting
              </TableHead>
              <TableHead className="text-center bg-gray-300">Onchain voting</TableHead>
              <TableHead className="text-center font-extrabold bg-gray-300">
                DAVINCI Protocol
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Opensource</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="block text-center bg-red-100">❌</TableCell>
              <TableCell className="bg-background text-center bg-green-100">✅</TableCell>
              <TableCell className="bg-background text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Decentralized</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-green-100">✅</TableCell>
              <TableCell className="text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Censorship-resistant</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Anonimity</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Scalability</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Transparent</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Veifiable</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Anticoercion</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅&lt;br&gt;</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Affordable</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Trustless</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium bg-gray-200">Flexible voting methods</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-center bg-yellow-100">🟡</TableCell>
              <TableCell className="text-center bg-red-100">❌</TableCell>
              <TableCell className="text-right text-center bg-green-100">✅</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
      <section
        id="solutions"
        className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6"
      >
        <Grainify />
        <Gradient className="absolute top-0 -translate-y-1/2" />
        <Badge text="What's next?" />
        <div className="flex flex-col sm:flex-row justify-between gap-x-16 gap-y-4">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl grow">
            Roadmap
          </h2>
          <text className="max-w-md sm:text-right text-balance">
            We’re launching DAVINCI in 2025! Soon, you’ll be able to explore it, test its features,
            and become part of the network.
          </text>
        </div>
        <Image alt="Image" src="/images/DAVINCIlandingassetroadmap.png" width={1500} height={500} />
        <Card className="overflow-hidden border-none shadow-md">
          <Tabs defaultValue="item-1">
            <TabsContent value="item-1" className="mt-0" />
            <TabsContent value="item-2" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Shape the User Journey</h3>
                  <p className="text-muted-foreground">
                    Leverage built-in best practices to tailor your copy for each stage of the
                    funnel—awareness, consideration, or decision.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/ux-indonesia-w00FkE6e8zE-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-3" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Flexible Integrations</h3>
                  <p className="text-muted-foreground">
                    Seamlessly integrate with popular marketing tools, from CMS platforms to email
                    automation software. Manage everything in one place.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/markus-spiske-Skf7HxARcoc-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-4" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">Data-Driven Impact</h3>
                  <p className="text-muted-foreground">
                    Monitor conversions, track engagement, and fine-tune your strategy. Data
                    dashboards make measuring impact a breeze.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/nasa-Q1p7bh3SHj8-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </section>
      <section
        id="solutions"
        className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6"
      >
        <Grainify />
        <Gradient className="absolute top-0 -translate-y-1/2" />
        <Badge text="FEATURES" />
        <div className="flex flex-col sm:flex-row justify-between gap-x-16 gap-y-4">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl grow">
            One protocol. Many use cases.&lt;br&gt;
          </h2>
          <text className="sm:text-right text-balance max-w-md block">
            With low costs and high flexibility, DAVINCI seamlessly adapts to any use case
          </text>
        </div>
        <Card className="overflow-hidden border-none shadow-md">
          <Tabs defaultValue="item-1">
            <div className="w-full overflow-auto grid bg-muted">
              <TabsList className="mx-auto w-max flex-none inline-flex">
                <TabsTrigger value="item-1">DAO voting</TabsTrigger>
                <TabsTrigger value="item-2">High-stake voting</TabsTrigger>
                <TabsTrigger value="item-3">Flexible governance</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="item-1" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">
                    Gasless, anonymous and anticoercion voting&nbsp; with the same level of
                    guarantes as onchain voting&lt;br&gt;
                  </h3>
                  <p className="text-muted-foreground">
                    Onchain voting has been expensive, restrictive, and a privacy nightmare.
                    &lt;br&gt;&lt;br&gt;DAVINCI changes that. For the first time, DAOs can
                    experience anonymous, anti-coercion, and flexible voting.
                    &lt;br&gt;&lt;br&gt;Allowing more governance mechanisms, voter privacy, less
                    biases (e.g. bandwagon effect), and a gasless experience. &lt;br&gt;
                  </p>
                  <Button className="w-fit rounded-full">Interested? Contact us!</Button>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/shubham-dhage-mwzdze5NVrI-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-2" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">
                    The new standard for secure and fair elections
                  </h3>
                  <p className="text-muted-foreground">
                    Not all votes are equal, but they all deserve the same level of protection. With
                    DAVINCI, security, privacy, and transparency are no longer privileges, they’re
                    guaranteed for every election, big or small.
                    <br />
                    Most critically, DAVINCI empowers those who need it the most: cities, political
                    parties, and opposition groups in nations where democratic processes are under
                    threat. With DAVINCI, voting remains a right, not a risk. And that includes
                    strong protection against vote buying and coercion.
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/arnaud-jaegers-5CoOYSxILSw-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="item-3" className="mt-0">
              <div className="p-8 grid gap-8 bg-background mt-0 lg:grid-cols-2">
                <div className="flex flex-col gap-4 order-2 lg:order-none justify-center">
                  <h3 className="text-2xl font-bold font-heading">
                    Voting technology should adapt to your needs, not the other way around.
                  </h3>
                  <p className="text-muted-foreground">
                    Every organization has unique voting needs.
                    <br />
                    <br />
                    DAVINCI supports multiple voting mechanisms, including simple, ranked, and
                    quadratic voting, allowing to tailor elections to specific use cases. You
                    control the voting experience: decide if results should be live or revealed at a
                    predetermined block, and leverage vote overwriting to mitigate coercion. With
                    DAVINCI, voting systems are not just secure but also highly
                    customizable.&lt;br&gt;
                  </p>
                </div>
                <div className="relative rounded-xl overflow-hidden border">
                  <Image
                    alt="Research transparency visualization"
                    src="/images/sebastien-bonneval-UIpFY1Umamw-unsplash.jpg"
                    width={500}
                    height={300}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </section>
      <section className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6">
        <Grainify />
        <Gradient className="absolute bottom-0 translate-y-1/2" />
        <div className="bg-[rgba(255,255,255,0)] bg-[linear-gradient(0deg,_rgba(255,255,255,0)_50%,_#eaeaea_50%)] bg-[length:12px_12px] absolute inset-0 -z-[1] opacity-50 translate-x-1/2 -translate-y-1/2 [clip-path:ellipse(50%_50%_at_50%_50%)]" />
        <Badge text="A UNIVERSAL VOTING PROTOCOL" />
        <div className="flex flex-col gap-y-8">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl">
            Designed by Vocdoni. Built for everyone.
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-background shadow-md">
              <h3 className="font-heading text-2xl font-bold mb-4">Neutrality</h3>
              <p className="text-muted-foreground">
                A truly fair voting system must be free from political, corporate, or centralized
                control. DAVINCI ensures neutrality by operating on a decentralized infrastructure,
                where no single entity can manipulate, censor, or bias election results.{" "}
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-background shadow-md">
              <h3 className="font-heading text-2xl font-bold mb-4">Unstoppable governance</h3>
              <p className="text-muted-foreground">
                DAVINCI is built as an unstoppable, autonomous voting protocol powered by
                zero-knowledge cryptography and decentralized infrastructure. By leveraging a
                token-driven model, DAVINCI fosters sustainability making it a truly autonomous and
                resilient governance solution.
              </p>
            </div>
          </div>
          <div className="p-8 rounded-2xl flex flex-col justify-between bg-background shadow-md">
            <div className="flex flex-col">
              <h3 className="font-heading text-2xl font-bold mb-4">
                Built by Vocdoni for the World&lt;br&gt;
              </h3>
              <p className="text-muted-foreground mb-6">
                DAVINCI is the result of merging Vocdoni’s expertise with cutting-edge developments
                like MACI, Circom, SnarkJS, and Gnark. Getting inspired by these projects and
                leveraging these thecnologies, we have crafted a voting protocol that ensures
                fairness, accessibility, and trust for all.
                <br />
                <br />
                But we don’t own this protocol! We’re simply the catalysts. DAVINCI is an open,
                neutral voting system built for the world, and its future depends on collective
                work. Everyone is welcome to contribute, shape, and improve it. Want to be part of
                the movement?
              </p>
            </div>
            <Button className="rounded-full">
              Contribute on Github
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      <section className="flex flex-col w-full rounded-3xl relative isolate bg-card text-card-foreground gap-y-8 overflow-hidden md:p-12 p-6">
        <Grainify />
        <Gradient className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2" />
        <div className="bg-[rgba(255,255,255,0)] bg-[length:12px_12px] absolute inset-0 -z-[1] opacity-50 translate-x-1/2 -translate-y-1/2 [clip-path:ellipse(50%_50%_at_50%_50%)] bg-[repeating-linear-gradient(-45deg,_#eaeaea,_#eaeaea_6px,_rgba(255,255,255,0)_6px,_rgba(255,255,255,0)_30px)]" />
        <Badge text="Talk about us" />
        <div className="flex flex-col gap-y-8">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl">
            A protocol endorsed by the best
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-lg text-left">
            Top cryptographers and industry leaders agree: we need a universal, unstoppable, and
            privacy-first voting protocol, powered by decentralized technology.
          </p>
        </div>
        <Carousel
          opts={{ loop: true, align: "start" }}
          orientation="horizontal"
          className="mt-6 w-full px-4 xl:px-0"
        >
          <CarouselPrevious className="-left-6 size-7 xl:-left-12 xl:size-8 ml-2" />
          <CarouselContent>
            <TestimonialItem
              name="Jordi Baylina"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ornare lacus enim, fringilla maximus sapien sollicitudin id."
              image="/images/jordibaylina.jpg"
              username="Polygon co-founder"
            />
            <TestimonialItem
              name="Antoni Martín"
              text="DAVINCI has the technical design and attributes to become the universal voting solution. Together with PrivadoID’s self-sovereign identity solutions, we envision a new generation of secure, tamper-proof and accessible digital democracy."
              image="/images/testimonialsantoniprivadoid.jpg"
              username="COO Privado ID & Polygon zkEVM co-founder"
            />
            <TestimonialItem
              name="Arnau Bennassar"
              text="For nearly a decade, Vocdoni has been cooking the future of voting. Recent breakthroughs in ZK and blockchain enabled the ideal solution. DAVINCI stands as the ultimate, unrivaled answer to secure, transformative elections."
              image="/images/testimonailsarnaubenassarpolygon.jpg"
              username="Engineering Lead at Polygon CDK"
            />
            <TestimonialItem
              name="Marta Bellés"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec ultrices orci. Vivamus ante arcu, hendrerit bibendum felis a, volutpat feugiat tellus. Aliquam erat volutpat."
              image="/images/151.jpeg"
              username="Polytechnic University of Catalonia"
            />
            <TestimonialItem
              name="John doe"
              text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec ultrices orci. Vivamus ante arcu, hendrerit bibendum felis a, volutpat feugiat tellus. Aliquam erat volutpat."
              image="/images/153.jpeg"
              username="Ethereum white hat hacker"
            />
          </CarouselContent>
          <CarouselNext className="-right-6 size-7 xl:-right-12 xl:size-8 mr-[8px]" />
        </Carousel>
      </section>
      <section className="w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6">
        <Grainify />
        <Gradient className="absolute -translate-x-1/2 top-0 -translate-y-1/2 left-1/2" />
        <Badge text="FAQ" />
        <div className="flex flex-col gap-y-8">
          <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-lg text-left">
            For any other questions, feel free to contact us on our chat.
          </p>
          <Accordion type="single" collapsible className="mt-6 w-full divide-y">
            <FaqItem
              answer="Vocdoni Davinci is our cutting-edge, zero-knowledge (zk) based voting protocol designed to achieve full decentralization and address the primary challenges of digital voting systems. By leveraging zkSNARKs and threshold homomorphic encryption (ElGamal), Davinci ensures critical features such as receipt-freeness, voter privacy, scrutiny transparency, and universal auditing. This universal voting protocol eliminates the need for a trusted coordinator, enhancing security and trust throughout the voting process. Operating as a specialized Layer 2 solution on the Ethereum blockchain, Davinci utilizes a decentralized zkSNARK-based state machine to provide censorship-resistance, integrity, and trustless operation, while allowing for transparent scrutiny of results.  Designed for scalability and accessibility, Vocdoni Davinci supports high-frequency, low-cost voting suitable for mass adoption across various organizations, including DAOs, governmental bodies, and large enterprises. The system employs distributed key generation (DKG) among sequencers, coordinated via smart contracts, to enable secure and decentralized encryption key creation without relying on a central authority. This robust infrastructure ensures end-to-end verifiability and anonymity for users, making Vocdoni Davinci a powerful and reliable solution for secure, transparent, and efficient digital voting."
              question="What is DAVINCI Protocol?"
            />
            <FaqItem
              answer="Unlike traditional voting systems that rely on centralized authorities and can be vulnerable to fraud and manipulation, Vocdoni is built on decentralized blockchain technology. This ensures greater security, transparency, and anonymity while significantly reducing costs and enhancing scalability. Additionally, our use of zero-knowledge proofs guarantees that every vote is both private and verifiable."
              question="How does Vocdoni differ from traditional voting systems?"
            />
            <FaqItem
              answer="Vocdoni is versatile and can be used by a wide range of organizations, including DAOs, political parties, city councils, professional associations, and even movements under scrutiny. Whether you’re managing a small community vote or a high-stakes election, Vocdoni provides a secure and scalable solution tailored to your needs."
              question="Who can use DAVINCI?"
            />
            <FaqItem
              answer="We prioritize voter privacy by using homomorphic encryption and zero-knowledge proofs. These technologies encrypt each vote, making it impossible to trace back to the individual voter while still allowing the votes to be counted and verified securely. This ensures that every vote remains private and your identity is protected throughout the entire process."
              question="How does Vocdoni ensure the anonymity of voters?"
            />
            <FaqItem
              answer="Decentralization removes the reliance on a single authority or server, reducing the risk of manipulation, censorship, and single points of failure. By distributing the voting process across a network, Vocdoni ensures that the system remains robust, secure, and accessible to everyone, no matter where they are or who they are."
              question="Why decentralization is important?"
            />
            <FaqItem
              answer="Vocdoni incorporates features like anonymity, receipt-freeness, and zero-knowledge proofs to prevent coercion and vote buying and problems like bandwagon effect, vote profiling or having to pay to vote. Anonymity ensures that votes cannot be traced back to voters, while receipt-freeness means voters cannot prove how they voted to anyone else, deterring coercion. Additionally, our decentralized and cryptographic foundations protect against tampering, ensuring that every vote is counted accurately and securely. These safeguards are essential for maintaining the integrity and trustworthiness of the voting process."
              question="How we ensure that our protocol is resistant to coercion, vote buying and tampering? Why is it important?"
            />
            <FaqItem
              answer="Absolutely! Vocdoni is designed to handle elections of all scales, including governmental and national elections. Its robust security, scalability, and verifiability make it a suitable choice for high-stakes voting environments, ensuring that every vote is secure, private, and accurately counted. It's also suitable for any other use case, including Web3 organizations."
              question="Can Vocdoni be used for governmental or national elections?"
            />
            <FaqItem
              answer="We’re excited to announce that the Vocdoni Davinci testnet is set to launch in the first half of 2025 (Q1–Q2 2025). This phase will allow us to test the new protocol, gather valuable feedback, and make necessary improvements before the full deployment."
              question="When is the Vocdoni testnet expected to launch?"
            />
            <FaqItem
              answer="The Vocdoni token (VOC) is the native cryptocurrency of the Vocdoni ecosystem. It serves multiple purposes, including incentivizing sequencers who process votes, facilitating payments for voting processes, and enabling decentralized governance within the network. By aligning the interests of all participants, VOC ensures the sustainability and security of our decentralized voting infrastructure."
              question="What is the Vocdoni token (VOC), and what is its purpose?"
            />
            <FaqItem
              answer="Davinci is a neutral, open-source voting protocol that no one owns. Started by the Vocdoni project, Davinci is open for anyone to join and help develop it."
              question="Who is building DAVINCI Protocol?"
            />
            <FaqItem
              answer="Not at all. Our platform is designed to be user-friendly, with intuitive suggestions you can accept, revise, or ignore. Even if you’re brand-new to marketing, you’ll see immediate impWe’d love your help! You can contribute by joining our public repositories on GitHub, participating in our testnet, providing feedback in our community chat, or even contributing code if you have the technical expertise. Visit our developer portal and connect with us on Discord to get started and collaborate with our community.rovements in clarity and conversion rates."
              question="How can I contribute to the development or testing of Vocdoni?"
            />
          </Accordion>
        </div>
        <div className="text-center">
          <Button asChild={false} variant="link">
            More FAQs
          </Button>
        </div>
      </section>
      <section
        style={{
          backgroundSize: "cover",
          backgroundImage: "url('https://i.ibb.co/H6gjXCg/Landing-Bg.jpg')",
          backgroundPosition: "center",
        }}
        className="w-full flex flex-col rounded-3xl bg-accent text-accent-foreground relative isolate overflow-hidden gap-y-8 md:p-12 p-6"
      >
        <div className="flex flex-col items-center gap-y-8">
          <h2 className="font-heading tracking-tight text-balance text-center text-5xl sm:text-7xl">
            DAVINCI Protocol
          </h2>
        </div>
        <Button className="rounded-full mx-auto bg-white text-black hover:bg-white/90 text-lg px-8 py-6 flex text-center flex-row justify-center gap-3">
          Read the whitepaper
        </Button>
      </section>
      <section />
      <footer className="container mt-10 flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <p className="text-center text-sm">DAVINCI Protocol. Made with ❤️ by Vocdoni.</p>
        <div className="flex items-center gap-5">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 438.549 438.549" className="size-5">
              <path
                d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28.57 20"
              className="size-5"
            >
              <g transform="translate(3.51, 0) scale(0.129)">
                <path
                  d="M55.8902 155H0.999897V149C0.999897 146.239 3.23865 144 6.00007 144H6.99998V138C6.99998 135.239 9.2385 133 11.9999 133V43.9999H6.50002L0 21.9999H29V0H138V21.9999H167L160.5 43.9999H155V133C157.762 133 160 135.239 160 138V144H161C163.761 144 166 146.239 166 149V155H111.171V149C111.171 146.239 113.41 144 116.172 144H117.171V138C117.171 135.296 119.318 133.093 122 133.003V84C120.231 64.3773 103.583 48.9999 83.5 48.9999C63.4169 48.9999 46.7685 64.3773 45 84V133.001C47.7106 133.06 49.8902 135.275 49.8902 138V141V144H50.8901C53.6515 144 55.8902 146.239 55.8902 149V155Z"
                  fill="currentColor"
                  clipRule="evenodd"
                  fillRule="evenodd"
                />
              </g>
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 248 204" className="size-5">
              <path
                d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
