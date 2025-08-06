#!/usr/bin/env python

'''
tags_generator.py
Copyright 2017 Long Qian
Contact: lqian8@jhu.edu
This script creates tags for your Jekyll blog hosted by Github page.
No plugins required.
'''

import glob
import os

post_dir = '../_posts/'
tag_dir = '../tag/'

filenames = glob.glob(post_dir + '*md')

total_tags = []
for filename in filenames:
    print('process file ' + filename)
    f = open(filename, 'r')
    crawl = False
    for line in f:
        if line.strip() == '---' and crawl:
            crawl = False
            break
        if crawl:
            current_tag = line.strip().split()[1]
            print('- ' + current_tag)
            total_tags.append(current_tag)
        if line.strip() == 'tags:':
            crawl = True
    f.close()
total_tags = set(total_tags)

old_tags = glob.glob(tag_dir + '*.md')
for tag in old_tags:
    os.remove(tag)
    
if not os.path.exists(tag_dir):
    os.makedirs(tag_dir)

for tag in total_tags:
    tag_filename = tag_dir + tag + '.md'
    f = open(tag_filename, 'a')
    write_str = '---\nlayout: tag\ntitle: \"#' + tag + '\"\ntag: ' + tag + '\nrobots: noindex\n---\n'
    f.write(write_str)
    f.close()

print("Tags generated, count", total_tags.__len__())