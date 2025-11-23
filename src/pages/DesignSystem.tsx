import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Sparkles, Zap, Shield, Cpu, Brain, Rocket, 
  Check, X, AlertCircle, Info 
} from "lucide-react";
import logo from "@/assets/neohoosh-logo-new.png";

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Neohoosh Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold font-display">Neohoosh Design System</h1>
              <p className="text-muted-foreground">سیستم طراحی جهانی نئوهوش</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Brand Identity */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Brand Identity</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>Modern AI-Tech Logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-xl p-8 flex items-center justify-center">
                  <img src={logo} alt="Neohoosh Logo" className="w-32 h-32" />
                </div>
                <div className="bg-card border rounded-xl p-8 flex items-center justify-center">
                  <img src={logo} alt="Neohoosh Logo" className="w-32 h-32" />
                </div>
                <div className="bg-foreground rounded-xl p-8 flex items-center justify-center">
                  <img src={logo} alt="Neohoosh Logo" className="w-32 h-32 invert" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Primary Color Palette</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-primary shadow-glow"></div>
                    <div>
                      <p className="font-semibold">Primary</p>
                      <p className="text-sm text-muted-foreground">hsl(195 100% 45%)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-secondary shadow-glow-secondary"></div>
                    <div>
                      <p className="font-semibold">Secondary</p>
                      <p className="text-sm text-muted-foreground">hsl(280 70% 55%)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-accent shadow-glow-accent"></div>
                    <div>
                      <p className="font-semibold">Accent</p>
                      <p className="text-sm text-muted-foreground">hsl(160 80% 45%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Typography</h2>
          <Card>
            <CardHeader>
              <CardTitle>Font Families & Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <p className="text-sm text-muted-foreground mb-4">Display Font: Space Grotesk</p>
                <h1 className="font-display">Heading 1 - نمونه متن فارسی</h1>
                <h2 className="font-display">Heading 2 - نمونه متن فارسی</h2>
                <h3 className="font-display">Heading 3 - نمونه متن فارسی</h3>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-4">Body Font: Inter / Vazirmatn</p>
                <p className="text-lg">Large Text - متن بزرگ برای توضیحات مهم</p>
                <p className="text-base">Base Text - متن پایه برای محتوای اصلی</p>
                <p className="text-sm">Small Text - متن کوچک برای توضیحات</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Color System */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Color System</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Primary */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-primary-light"></div>
                  <span className="text-sm">Light</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-primary"></div>
                  <span className="text-sm">Default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-primary-dark"></div>
                  <span className="text-sm">Dark</span>
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-success"></div>
                  <span className="text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-warning"></div>
                  <span className="text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-destructive"></div>
                  <span className="text-sm">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-info"></div>
                  <span className="text-sm">Info</span>
                </div>
              </CardContent>
            </Card>

            {/* Neutrals */}
            <Card>
              <CardHeader>
                <CardTitle>Neutral Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-background border"></div>
                  <span className="text-sm">Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-card border"></div>
                  <span className="text-sm">Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-muted"></div>
                  <span className="text-sm">Muted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded bg-foreground"></div>
                  <span className="text-sm">Foreground</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Buttons</h2>
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold">Primary</p>
                  <div className="flex flex-wrap gap-4">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="lg" className="shadow-glow">
                      <Sparkles className="mr-2" />
                      With Icon
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold">Secondary</p>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="secondary" size="sm">Small</Button>
                    <Button variant="secondary">Default</Button>
                    <Button variant="secondary" size="lg">Large</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold">Outline</p>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" size="sm">Small</Button>
                    <Button variant="outline">Default</Button>
                    <Button variant="outline" size="lg">Large</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold">Ghost</p>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="ghost" size="sm">Small</Button>
                    <Button variant="ghost">Default</Button>
                    <Button variant="ghost" size="lg">Large</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Icons */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Icons</h2>
          <Card>
            <CardHeader>
              <CardTitle>Icon Set</CardTitle>
              <CardDescription>Lucide Icons - Consistent stroke width</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <span className="text-xs">Sparkles</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="w-8 h-8 text-primary" />
                  <span className="text-xs">Zap</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Shield className="w-8 h-8 text-primary" />
                  <span className="text-xs">Shield</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Cpu className="w-8 h-8 text-primary" />
                  <span className="text-xs">Cpu</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Brain className="w-8 h-8 text-primary" />
                  <span className="text-xs">Brain</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Rocket className="w-8 h-8 text-primary" />
                  <span className="text-xs">Rocket</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Check className="w-8 h-8 text-success" />
                  <span className="text-xs">Check</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <X className="w-8 h-8 text-destructive" />
                  <span className="text-xs">X</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Form Elements</h2>
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Field</label>
                <Input placeholder="نام خود را وارد کنید" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Checkbox</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="check1" />
                    <label htmlFor="check1">Option 1</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check2" />
                    <label htmlFor="check2">Option 2</label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Switch</label>
                <div className="flex items-center gap-4">
                  <Switch />
                  <span className="text-sm">Toggle Option</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards & Badges */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Cards & Badges</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>This is a card description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cards are used to group related content and actions.
                  این کارت برای نمایش محتوای مرتبط استفاده می‌شود.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Badges</CardTitle>
                  <Badge>New</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Spacing & Grid */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Spacing System</h2>
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm">xs (4px)</div>
                  <div className="h-4 bg-primary rounded" style={{ width: '0.25rem' }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm">sm (8px)</div>
                  <div className="h-4 bg-primary rounded" style={{ width: '0.5rem' }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm">md (16px)</div>
                  <div className="h-4 bg-primary rounded" style={{ width: '1rem' }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm">lg (24px)</div>
                  <div className="h-4 bg-primary rounded" style={{ width: '1.5rem' }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm">xl (32px)</div>
                  <div className="h-4 bg-primary rounded" style={{ width: '2rem' }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 text-sm">2xl (48px)</div>
                  <div className="h-4 bg-primary rounded" style={{ width: '3rem' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Shadows & Effects */}
        <section>
          <h2 className="text-4xl font-bold mb-8 font-display">Shadows & Effects</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-center font-semibold">Small Shadow</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <p className="text-center font-semibold">Medium Shadow</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <p className="text-center font-semibold">Large Shadow</p>
              </CardContent>
            </Card>
            <Card className="shadow-glow">
              <CardContent className="pt-6">
                <p className="text-center font-semibold text-primary">Primary Glow</p>
              </CardContent>
            </Card>
            <Card className="shadow-glow-secondary">
              <CardContent className="pt-6">
                <p className="text-center font-semibold text-secondary">Secondary Glow</p>
              </CardContent>
            </Card>
            <Card className="shadow-glow-accent">
              <CardContent className="pt-6">
                <p className="text-center font-semibold text-accent">Accent Glow</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystem;
