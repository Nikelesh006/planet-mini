import os

def fix_baby_care():
    path = r"c:\THE ONE\planet-mini\client\src\components\BabyCareCard.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # The tool deleted from <div className="aspect-[2/3] to alt={product.name}
    # Let's see if we can find className="w-full h-full object-cover rounded-3xl
    # and insert the missing block before it.
    
    if 'className="w-full h-full object-cover rounded-3xl transition-all duration-300"' in content and '<div className="aspect-[2/3]' not in content:
        broken_part = '              className="w-full h-full object-cover rounded-3xl transition-all duration-300"'
        fixed_part = '''          {/* Large Product Image */}
          <div className="aspect-[2/3] sm:aspect-[3/4] flex items-center justify-center relative bg-transparent">
            {/* Discount Badge */}
            {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-md">
                  {Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}% OFF
                </div>
              </div>
            )}
            <img
              src={getCloudinaryImageUrl(product.image, "f_auto,q_100,dpr_auto")}
              alt={product.name}
              className="w-full h-full object-cover rounded-3xl transition-all duration-300"'''
        content = content.replace(broken_part, fixed_part)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed BabyCareCard.tsx")

def fix_product_grid():
    path = r"c:\THE ONE\planet-mini\client\src\components\ProductGrid.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if '<div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">' in content and '{discountPercentage}%' not in content:
        broken_part = '''                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                  <div className="absolute top-4 right-4 flex flex-col gap-2">'''
        fixed_part = '''                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    {product.originalPrice && Number(product.originalPrice) > Number(product.price || 0) && (() => {
                      const originalPrice = Number(product.originalPrice);
                      const currentPrice = Number(product.price || 0);
                      const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                      return (
                        <span className="bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-md">
                          {discountPercentage}% OFF
                        </span>
                      );
                    })()}
                  </div>

                  {/* Floating Actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">'''
        content = content.replace(broken_part, fixed_part)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed ProductGrid.tsx")

def update_other_cards():
    cards = [
        r"c:\THE ONE\planet-mini\client\src\components\ComboCard.tsx",
        r"c:\THE ONE\planet-mini\client\src\components\GiftingCard.tsx"
    ]
    
    for path in cards:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Target pattern:
        # <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
        #   -{Math.round...}%
        # </div>
        
        # Replace it with the new style and top-4 left-4 position
        # First fix position if it is top-2 left-2
        content = content.replace('className="absolute top-2 left-2 z-20"', 'className="absolute top-4 left-4 z-20"')
        
        import re
        pattern = re.compile(r'<div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">\s*-\{Math\.round\(\(\(Number\(product\.originalPrice\) - Number\(product\.price\)\) / Number\(product\.originalPrice\)\) \* 100\)\}%?\s*</div>')
        replacement = r'''<div className="bg-red-600 px-3 py-1 text-sm font-bold text-white shadow-md">
                {Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)}% OFF
              </div>'''
        
        content = pattern.sub(replacement, content)
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {path}")

fix_baby_care()
fix_product_grid()
update_other_cards()
