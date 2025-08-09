'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { User, Star, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function ExpertCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-24 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="overflow-hidden border-2 border-rose-200/50 shadow-2xl">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Expert Info */}
                <div className="p-8 lg:p-12 bg-gradient-to-br from-white to-rose-50/50 dark:from-card dark:to-rose-950/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Dherya Bajaj</h3>
                      <p className="text-muted-foreground">Certified Fitness Expert</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">(4.9/5)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Expertise Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Fitness Training</Badge>
                        <Badge variant="secondary">Nutrition Coaching</Badge>
                        <Badge variant="secondary">Supplement Guidance</Badge>
                      </div>
                    </div>

                    <div className="bg-green-100 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-400">Limited Time</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Free consultation sessions available!
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>
                      "5+ years of experience helping clients achieve their fitness goals 
                      with personalized training and nutrition plans."
                    </p>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="p-8 lg:p-12 bg-gradient-to-br from-rose-500 to-rose-600 text-white flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold mb-4">
                      Ready to Transform Your Fitness Journey?
                    </h2>
                    <p className="text-rose-100 mb-6 text-lg">
                      Get personalized guidance from our expert and start seeing real results. 
                      Book your free consultation today!
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Personalized fitness assessment</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Custom workout & nutrition plan</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Expert supplement recommendations</span>
                      </div>
                    </div>

                    <Link href="/consult">
                      <Button 
                        size="lg" 
                        className="w-full bg-white text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        Book Free Consultation
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>

                    <p className="text-xs text-rose-200 mt-3 text-center">
                      No commitment required • Response within 24 hours
                    </p>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}