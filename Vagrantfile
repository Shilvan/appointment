# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.synced_folder ".", "/vagrant", disabled: true
  config.vm.synced_folder ".", "/home/vagrant/provision", type: "rsync"

  # define artifactory 
  config.vm.define "artifact" do |artifact|
    artifact.vm.hostname = "manart1"
    artifact.vm.box = "debian/buster64"
    artifact.vm.network "private_network",type: "dhcp"
#    artifact.vm.network "forwarded_port", guest:80, host: 8081
    artifact.vm.provision "ansible" do |ansible|
      ansible.playbook = "../../playbook/artifactory.yml"
    end
  end

  config.vm.define "postgres" do |postgres|
    postgres.vm.hostname = "manpg1"
    postgres.vm.box = "debian/buster64"
    postgres.vm.network "private_network",type: "dhcp"
    postgres.vm.network "forwarded_port", guest: 5432, host: 5432
    postgres.vm.provision "ansible" do |ansible|
      ansible.playbook = "../../playbook/postgresdb.yml"
    end
  end
end
