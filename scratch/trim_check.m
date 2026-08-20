#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSImage *image = [[NSImage alloc] initWithContentsOfFile:@"images/logomark.png"];
        NSBitmapImageRep *rep = [[image representations] firstObject];
        NSInteger width = [rep pixelsWide];
        NSInteger height = [rep pixelsHigh];
        
        NSInteger minX = width, maxX = 0, minY = height, maxY = 0;
        for (NSInteger y = 0; y < height; y++) {
            for (NSInteger x = 0; x < width; x++) {
                NSColor *color = [rep colorAtX:x y:y];
                if ([color alphaComponent] > 0.05) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        NSLog(@"Tight bounds: x=[%ld, %ld] y=[%ld, %ld], w=%ld, h=%ld", (long)minX, (long)maxX, (long)minY, (long)maxY, (long)(maxX - minX + 1), (long)(maxY - minY + 1));
        
        // Export tight trimmed version
        NSRect cropRect = NSMakeRect(minX, minY, maxX - minX + 1, maxY - minY + 1);
        NSImage *cropped = [[NSImage alloc] initWithSize:cropRect.size];
        [cropped lockFocus];
        [image drawInRect:NSMakeRect(0, 0, cropRect.size.width, cropRect.size.height)
                 fromRect:cropRect
                operation:NSCompositingOperationCopy
                 fraction:1.0];
        [cropped unlockFocus];
        
        NSBitmapImageRep *cropRep = [NSBitmapImageRep imageRepWithData:[cropped TIFFRepresentation]];
        NSData *pngData = [cropRep representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
        [pngData writeToFile:@"images/logomark-tight.png" atomically:YES];
        NSLog(@"Saved images/logomark-tight.png successfully");
    }
    return 0;
}
