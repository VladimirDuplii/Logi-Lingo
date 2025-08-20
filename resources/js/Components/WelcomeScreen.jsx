import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function WelcomeScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <Card className="w-full max-w-md shadow-xl rounded-2xl p-6">
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-indigo-100 p-4 rounded-full"
          >
            <BookOpen className="w-10 h-10 text-indigo-600" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-bold text-gray-900 text-center"
          >
            Ласкаво просимо до LogicLingo
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600 text-center"
          >
            Навчайтесь у своєму темпі. Дізнавайтесь, практикуйте та ростіть.
          </motion.p>

          {/* Illustration placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full h-40 bg-indigo-50 rounded-xl flex items-center justify-center"
          >
            <span className="text-indigo-400">[Ілюстрація / графіка]</span>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full"
          >
            <Link href="/courses">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg py-6">
                Почати навчання
              </Button>
            </Link>
          </motion.div>

          {/* Secondary link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-gray-500 text-sm"
          >
            У мене вже є акаунт — 
            <Link href="/login" className="text-indigo-600 cursor-pointer hover:text-indigo-700 ml-1">
              Увійти
            </Link>
          </motion.p>
        </CardContent>
      </Card>
    </div>
  );
}
