#!/usr/bin/env ruby
# encoding: UTF-8
#
# Here should go some comment
#
# Author: Vasyl Zuzyak
#
require 'graph'

SPECS_HOME = 'specs'

specs = nil
specs2names = {}
specs_deps = {}
specs_soft_deps = {}
specs_reverse_deps = {} 

specs = Dir.entries(SPECS_HOME)
    .select { |item| item.end_with?('.js') }
    .reject { |item| item.include?('errors') }
    .reject { |item| item.include?('hints') }
    .sort

specs.each { |spec| 
    contents = File.readlines(File.join(SPECS_HOME, spec))

    match = contents.find { |line| /specName:/ =~ line }
    unless match.is_a?(String)
        puts "Can not get name of the spec for next file #{spec}"
        next
    end

    specName = match.match(/'(.+)'/)[1]
    specs2names[spec] = specName

    match = contents.find { |line| /dependencies:/ =~ line }
    if match.is_a?(String)
        deps = match.match(/\[([^\]]+)\]/)[1].gsub(',', '').gsub('\'', '')
        specs_deps[specName] = deps.split()
    else
        #puts "Can not get dependencies of the next file #{spec}"
    end

    match = contents.find { |line| /softDependencies:/ =~ line }
    if match.is_a?(String)
        deps = match.match(/\[([^\]]+)\]/)[1].gsub(',', '').gsub('\'', '')
        specs_soft_deps[specName] = deps.split()
    end
}

specs_reverse_deps = {} 

specs_deps.each do |name, deps_array|
    deps_array.each do |dependency|
        unless specs_reverse_deps.has_key?(dependency)
            specs_reverse_deps[dependency] = []
        end
        specs_reverse_deps[dependency] << name
    end
end

digraph do
    specs_reverse_deps.each do |key, arr|
        arr.each { |item|
            edge key, item
        }
    end

    save "specs_tree", "png"
end

